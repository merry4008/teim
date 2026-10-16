#!/usr/bin/env python3
"""TEUM manual Instagram publisher. Posting requires an explicit workflow confirmation."""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("META_GRAPH_API_VERSION", "v23.0")
TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
IG_ID = os.environ.get("INSTAGRAM_USER_ID", "")
BASE = f"https://graph.instagram.com/{API}"


def api_request(path, fields, *, get=False):
    params = {**fields, "access_token": TOKEN}
    url = f"{BASE}/{path}"
    if get:
        url += "?" + urllib.parse.urlencode(params)
        request = urllib.request.Request(url)
    else:
        request = urllib.request.Request(url, data=urllib.parse.urlencode(params).encode())
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read()).get("error", {})
            print(
                "Instagram API error:",
                detail.get("code"),
                detail.get("error_subcode"),
                detail.get("message"),
                file=sys.stderr,
            )
        except Exception:
            print("Instagram API HTTP error:", exc.code, file=sys.stderr)
        raise SystemExit(1)


def wait_until_ready(container_id):
    for _ in range(30):
        result = api_request(container_id, {"fields": "status_code"}, get=True)
        status = result.get("status_code")
        if status == "FINISHED":
            return
        if status in ("ERROR", "EXPIRED"):
            raise SystemExit("Instagram media processing failed: " + str(status))
        time.sleep(10)
    raise SystemExit("Timed out waiting for Instagram media processing")


def main():
    if not TOKEN or not IG_ID:
        raise SystemExit("Required GitHub settings: INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID")
    if os.environ.get("CONFIRM_PUBLISH") != "PUBLISH":
        raise SystemExit("Publishing requires explicit CONFIRM_PUBLISH=PUBLISH")

    manifest_path = os.environ.get("POST_MANIFEST", "instagram_automation/post.json")
    if not os.path.isfile(manifest_path):
        raise SystemExit(
            "No approved post manifest found. Add instagram_automation/post.json "
            "with a verified public image URL and approved caption."
        )

    with open(manifest_path, encoding="utf-8") as manifest_file:
        post = json.load(manifest_file)

    images = post.get("images")
    caption = post.get("caption")
    if not isinstance(images, list) or not 1 <= len(images) <= 10:
        raise SystemExit("Post requires a list of 1–10 image URLs")
    if not isinstance(caption, str) or not caption.strip():
        raise SystemExit("Post requires a nonempty caption")
    if any(not isinstance(url, str) or not url.startswith("https://") for url in images):
        raise SystemExit("Each image must have a publicly accessible HTTPS URL")

    if len(images) == 1:
        media = api_request(
            f"{IG_ID}/media",
            {"image_url": images[0], "caption": caption},
        )
        wait_until_ready(media["id"])
        published = api_request(
            f"{IG_ID}/media_publish",
            {"creation_id": media["id"]},
        )
    else:
        children = []
        for url in images:
            child = api_request(
                f"{IG_ID}/media",
                {"image_url": url, "is_carousel_item": "true"},
            )
            children.append(child["id"])
            wait_until_ready(child["id"])
        parent = api_request(
            f"{IG_ID}/media",
            {
                "media_type": "CAROUSEL",
                "children": ",".join(children),
                "caption": caption,
            },
        )
        wait_until_ready(parent["id"])
        published = api_request(
            f"{IG_ID}/media_publish",
            {"creation_id": parent["id"]},
        )

    media_id = published.get("id")
    if not media_id:
        raise SystemExit("Instagram did not return a published media ID")
    result = api_request(media_id, {"fields": "permalink"}, get=True)
    permalink = result.get("permalink")
    print("Published Instagram post:", permalink or f"media ID {media_id}")


if __name__ == "__main__":
    main()
