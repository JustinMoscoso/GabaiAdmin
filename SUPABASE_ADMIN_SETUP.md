# Supabase Admin Setup

## 1. Add the edge function

Deploy the function in `supabase/functions/invite-parent/index.ts`.

Recommended command from the Supabase CLI:

```bash
supabase functions deploy invite-parent
```

## 2. Set function secrets

You need these secrets on the Supabase project:

```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Do not put the service role key in the frontend.

## 3. Add a public admin policy model

Your browser app uses the public anon key, so RLS must allow admin users to read/write the tables you want to manage.

At minimum, define policies that allow authenticated users with `public.users.role = 'admin'` to:

- `select`, `insert`, `update`, and `delete` on `public.users`
- `select`, `insert`, `update`, and `delete` on `public.children`
- `select`, `insert`, `update`, and `delete` on `public.rules`
- `select`, `insert`, `update`, and `delete` on `public.blocked_content`
- `select`, `insert`, `update`, and `delete` on `public.notifications`
- `select`, `insert`, `update`, and `delete` on `public.pairing_tokens`
- `select`, `insert`, `update`, and `delete` on `public.app_usage`
- `select` on `public.audit_logs`

## 4. Make sure your admin user exists

The user you sign in with in the admin UI must have:

- a Supabase Auth account
- a matching row in `public.users`
- `role = 'admin'`
- `is_active = true`

## 5. Parent invite flow

Use the new invite form on the Parents page.

It calls the `invite-parent` function, which:

- sends the auth invite email
- creates or updates the profile row in `public.users`

If invite emails do not arrive, check:

- project email settings
- spam folder
- auth email templates
- whether the function deployed successfully

