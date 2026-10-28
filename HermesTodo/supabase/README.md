# HermesTodo — GitHub Pages + Supabase cloud synchronization

The website URL stays https://raynacocobobobo-arch.github.io/DND/hermestodo/.
GitHub stores and publishes the website code, not task data.
Supabase Auth (email/password) and Postgres with Row Level Security (RLS)
store user-owned task data. No Git commits or separately hosted Node.js
server are required for daily tasks.

## First-time setup

1. Create a Supabase project at https://supabase.com/dashboard.
2. In SQL Editor, execute the supplied schema.sql to create hermes_contexts,
   hermes_tasks, indexes and per-account access policies.
3. Under Authentication > Providers > Email, enable email/password sign-in.
   Depending on configuration, email confirmation may be required.
4. Copy the Project URL (https://xxxx.supabase.co) and the publishable key
   (sb_publishable_...), or legacy anon JWT, from Supabase API settings.
   Never use secret keys or service_role credentials in a browser.
5. Open the HermesTodo Pages site. Click 连接云端, paste the public Project URL
   and publishable key, and select 保存云端连接. The page will reload.
6. Register/login with email and password. Create a test list and task, then
   open the same URL on another device. Configure the same public project URL
   and publishable key, sign in with the same account and verify the list.

## Safeguards and limits

- RLS allows each authenticated user to access only records they own.
- List/task relations have owner-scoped foreign keys.
- The static site uses a public publishable key and user-specific access tokens.
- Unconfigured clients continue to use browser-local demonstration mode.
- Existing local demo data remains local: it is never deleted or silently
  imported into the cloud account.
- Cloud writes require internet access; offline write queue and automatic
  conflict resolution have not yet been added.
- The AI demo in Pages is an offline sample, not a paid AI service.
  Saving AI suggestions in cloud mode persists the resulting tasks.
- Configure Supabase database backups separately if you will use this for
  important tasks.
- To return to local mode, open 云端设置 and click 返回浏览器演示模式.
  Doing so does not delete cloud data.
- If email confirmation is enabled, set Supabase Auth Site URL to
  https://raynacocobobobo-arch.github.io/DND/hermestodo/ so confirmations
  return to the app.

## Troubleshooting

- Failed to fetch: ensure the Supabase Project URL uses HTTPS and the
  project is active.
- Unauthorized: reauthenticate. The browser refreshes expired access tokens.
- Missing table: run schema.sql in the correct project SQL Editor and wait for
  the REST schema cache to refresh.
- Permission denied: verify the user is signed in and RLS/grants were applied.
