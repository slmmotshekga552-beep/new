# eCompliance — OHS Compliance Portal

A compliance portal for South African site teams: sign in with a 7-digit username, work
through an ISO 45001:2018 operational audit (tasks → subtasks → questions), upload evidence
per employee, and track what still needs action.

## What is in this folder

| Path | What it does |
| --- | --- |
| `public/portal.html` | The whole portal UI: sign in, sign up, dashboard, employees, tasks, audit reports, about. |
| `public/audit-workspace.js` | The audit workspace: task list, subtask list, question editor, status colours, employee blocks, document view/download. |
| `public/audit-workspace.css` | Styling for the audit workspace. |
| `public/audit-template.js` | The audit questions themselves (sections, tasks, subtasks, guidance, required flags). Edit here to change the questionnaire. |
| `public/cloud.js` | Online storage bridge: accounts, saved answers, next-audit date and uploaded evidence. |
| `public/portal-extras.js` | Extra portal behaviour: announcements, escalation, backup/restore, PIN lock, translations. |
| `src/` | The TanStack Start / React app that hosts the portal and its page metadata. |
| `drizzle/migrations/0000_migration.sql` | The complete database setup: tables, row-level-security policies, signup trigger, evidence-storage rules. |
| `supabase/config.toml` | Backend project id. |

## Where the data lives

Data is stored online, not in the browser, so the same account works from any phone or laptop:

- **Accounts** — usernames are 7 digits; they sign in as `<username>@users.ecompliance.app`.
  Profile details (name, phone, position, CNC number, optional PIN) are in the `profiles` table.
- **Audit answers, employees, comments, statuses, next-audit date** — one JSON document per
  user in the `user_data` table.
- **Uploaded evidence files** — private `evidence` storage bucket, in a folder named after the
  user. Each user only ever sees their own data (enforced by row-level security).

## Running it locally

1. Install Node.js, then `npm i`.
2. Copy `.env.example` to `.env`.
3. `npm run dev` and open the printed address.

To run against your own backend instead of the one supplied, create a project, apply
`drizzle/migrations/0000_migration.sql`, create a private storage bucket called `evidence`,
then update the values in `.env` and the two lines at the top of `public/cloud.js`.

## Notes

- New accounts work immediately — email confirmation is off, because people sign in with a
  username rather than an email link.
- Forgotten passwords are reset by an administrator; there is no email reset link.
- The ZIP is the website only. Accounts, answers and uploaded documents stay in the online
  database, so they are not included here.

## Built with

TanStack Start · TypeScript · React · Tailwind CSS · Lovable Cloud
