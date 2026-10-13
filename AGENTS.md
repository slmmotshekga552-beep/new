<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Audit architecture
- Keep original portal authentication intact and integrate the site-level ISO audit through a separate post-login workspace script, so audit changes cannot alter registration or login.
- Store the source audit template separately from editable answers, preserving question IDs, source response types, references, guidance and Critical Few flags.
- Portal data lives in Lovable Cloud via public/cloud.js: 7-digit usernames map to synthetic auth emails, profiles hold account details, user_data holds each user's whole store as JSON, and evidence files sit in the private per-user `evidence` bucket — so legacy portal code keeps its in-memory shapes while every device sees the same data.
- Render the audit as task selection, subtask selection, and a single-question editor; persist explicit completion status separately from source answers and derive parent status from child statuses to prevent uploads or answer changes from silently marking work complete.
- Archive answers, employee records and evidence metadata when recording audit results; retain evidence blobs and reset review states for a new cycle so historical results survive next-audit preparation.
- Track certificate expiry per evidence file and require explicit validity review before an all-good status, so uploading a certificate cannot silently approve it.
