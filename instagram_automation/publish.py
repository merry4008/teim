#!/usr/bin/env python3
"""TEUM Instagram carousel publisher. Requires explicit manual workflow invocation."""
import json, os, sys, time, urllib.parse, urllib.request, urllib.error

API = os.environ.get("META_GRAPH_API_VERSION", "v23.0")
TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
IG_ID = os.environ.get("INSTAGRAM_USER_ID", "")
BASE = f"https://graph.instagram.com/{API}"

def request(path, fields):
    url = f"{BASE}/{path}"
    data = urllib.parse.urlencode({**fields, "access_token": TOKEN}).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=45) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read()).get("error", {})
            print("Meta API error:", detail.get("code"), detail.get("error_subcode"), detail.get("message"), file=sys.stderr)
        except Exception:
            print("Meta HTTP error:", exc.code, file=sys.stderr)
        raise SystemExit(1)

def get(path, fields):
    url = f"{BASE}/{path}?" + urllib.parse.urlencode({**fields, "access_token": TOKEN})
    try:
        with urllib.request.urlopen(url, timeout=45) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        print("Meta status check HTTP error:", exc.code, file=sys.stderr)
        raise SystemExit(1)

def wait(container_id):
    for _ in range(30):
        status = get(container_id, {"fields": "status_code"}).get("status_code")
        if status == "FINISHED":
            return
        if status in ("ERROR", "EXPIRED"):
            raise SystemExit("Media container failed: " + str(status))
        time.sleep(10)
    raise SystemExit("Timed out waiting for media processing")

def main():
    if not TOKEN or not IG_ID:
        raise SystemExit("Required GitHub secrets: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID")
    if os.environ.get("CONFIRM_PUBLISH") != "PUBLISH":
        raise SystemExit("Publishing disabled: explicit CONFIRM_PUBLISH=PUBLISH required")
    with open(os.environ.get("POST_MANIFEST", "instagram_automation/post.json"), encoding="utf-8") as f:
        post = json.load(f)
    images, caption = post.get("images", []), post.get("caption", "")
    if not 2 <= len(images) <= 10 or not caption.strip():
        raise SystemExit("Carousel requires 2-10 images and nonempty caption")
    if any(not isinstance(u, str) or not u.startswith("https://") for u in images):
        raise SystemExit("Each image must have a publicly accessible HTTPS URL")
    children = []
    for url in images:
        child = request(f"{IG_ID}/media", {"image_url": url, "is_carousel_item": "true"})
        children.append(child["id"])
        wait(child["id"])
    parent = request(f"{IG_ID}/media", {"media_type": "CAROUSEL", "children": ",".join(children), "caption": caption})
    wait(parent["id"])
    published = request(f"{IG_ID}/media_publish", {"creation_id": parent["id"]})
    print("Published Instagram media ID:", published.get("id"))

if __name__ == "__main__":
    main()
