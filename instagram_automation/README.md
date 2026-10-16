# TEUM Instagram publishing

Status: Manual publishing only. Scheduled or unattended publishing is disabled.

## Connection check

The repository uses the existing GitHub Actions secret `INSTAGRAM_ACCESS_TOKEN`.
The connection workflow checks the token through Instagram Login API and verifies
that the returned account ID matches the configured TEUM Instagram account ID.
Run this check before attempting a post.

## Manual publishing

1. Add `instagram_automation/post.json` with 1–10 publicly reachable HTTPS image URLs and the approved caption.
2. Confirm every image URL opens directly without login and serves the image itself.
3. Run **TEUM Instagram Manual Publish** on the default branch and enter `PUBLISH`.
4. Check the workflow result and Instagram post URL.

Do not commit access tokens or private data. Google Drive share pages are not direct
image URLs. Instagram must be able to fetch each image from its URL.

The publisher deliberately stops if the post manifest is missing or malformed.
Do not run the publishing workflow until the image asset and caption are approved.
