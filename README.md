# Bluewolf

## Supabase Production Setup

1. Apply every SQL file in `supabase/migrations` to the Supabase project.
2. Generate seed data from the current local stores when needed:

```bash
npm run export:supabase
```

3. Apply `supabase/seed/bluewolf-seed.sql` after migrations.
4. Configure the production runtime environment:

```bash
BLUEWOLF_DATABASE_PROVIDER=supabase
BLUEWOLF_UPLOAD_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_STORAGE_BUCKET=bluewolf-uploads
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it through
`NEXT_PUBLIC_*` variables.

After deployment, check `/api/system/readiness` while signed in as an admin. It
verifies the Supabase CMS/CRM runtime adapter and the atomic payment-finalize RPC
from `0003_atomic_payment_finalize.sql`.
