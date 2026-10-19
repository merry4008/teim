# TEUM Instagram publishing

Status: Manual publishing only. Scheduled or unattended publishing is disabled.

## Connection check

The repository uses the GitHub Actions secret `INSTAGRAM_ACCESS_TOKEN`.
Run **TEUM Instagram API Connection Check** before attempting a post. It checks
the Instagram Login API token and compares the returned account ID if
`INSTAGRAM_USER_ID` is configured as a repository secret.

If the check reports an API access or OAuth error, refresh the Instagram Login
token with the required publishing access in Meta, then replace the
`INSTAGRAM_ACCESS_TOKEN` repository secret. Do not paste the token into code,
issues, or chat.

## Manual publishing

1. Add `instagram_automation/post.json` with 1–10 publicly reachable HTTPS image URLs and the approved caption.
2. Confirm every URL opens without login and serves the image itself.
3. Set `"verification": "verified"` in the manifest only after checking every image URL.
4. Run **TEUM Instagram Manual Publish** on the default branch and enter `PUBLISH`.
5. Check the workflow result and Instagram post URL.

Do not commit access tokens or private data. Google Drive share pages are not
direct image URLs. Instagram must be able to fetch each image from its URL.

The publisher deliberately stops if the manifest is missing, malformed, or its
images are not marked verified. Do not run the publishing workflow until the
image assets and caption are approved.
