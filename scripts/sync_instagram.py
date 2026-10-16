#!/usr/bin/env python3
"""Refresh the public TEUM Instagram feed without exposing API credentials."""
import json
import os
import pathlib
import urllib.parse
import urllib.request

OUT = pathlib.Path("public/data/instagram-feed.json")
TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
if not TOKEN:
    raise SystemExit("Missing INSTAGRAM_ACCESS_TOKEN GitHub Actions secret")

params = urllib.parse.urlencode({
    "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}",
    "limit": "24",
    "access_token": TOKEN,
})
url = "https://graph.instagram.com/v26.0/me/media?" + params
req = urllib.request.Request(url, headers={"User-Agent": "TEUM-Instagram-Feed/1.0"})
with urllib.request.urlopen(req, timeout=30) as response:
    payload = json.load(response)
if "data" not in payload or not isinstance(payload["data"], list):
    raise RuntimeError("Instagram API returned no media data")
items = []
for item in payload["data"]:
    link = item.get("permalink", "")
    if not link.startswith("https://www.instagram.com/"):
        continue
    cover = item.get("thumbnail_url") or item.get("media_url") or ""
    if not cover.startswith("https://"):
        continue
    items.append({
        "id": str(item["id"]),
        "caption": item.get("caption", "")[:1800],
        "media_type": item.get("media_type", ""),
        "image": cover,
        "permalink": link,
        "timestamp": item.get("timestamp", ""),
    })
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"posts": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Synced {len(items)} Instagram posts")
