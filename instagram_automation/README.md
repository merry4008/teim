# TEUM Instagram publishing setup

Status: Manual publishing only. Daily unattended publishing is NOT enabled.

1. Existing GitHub secret INSTAGRAM_ACCESS_TOKEN is reused.
2. Add INSTAGRAM_USER_ID as a GitHub Actions repository secret (the numeric Instagram professional account ID, not username).
3. Provide instagram_automation/post.json with 2-10 public HTTPS image URLs and a caption.
4. Workflow TEUM Instagram Manual Publish requires typing PUBLISH.
5. Publish requires appropriate Meta permissions and valid token. Test on a safe post first.
6. The workflow must be available on the default branch before GitHub Actions manual dispatch can be used.

Manifest example:
```json
{"images":["https://example.com/slide1.jpg","https://example.com/slide2.jpg"],"caption":"TEUM test caption"}
```

Do not commit tokens or private data. GitHub repository files are not an image host. Google Drive share links are generally unsuitable as Instagram image_url; use publicly reachable direct HTTPS image assets.

Next stages: account ID discovery, asset hosting, approval, Drive integration, scheduled generation and posting. Never enable unattended publishing before a successful end-to-end test.
