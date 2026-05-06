create table if not exists app_email_verifications (
    email text primary key,
    code text not null,
    token text,
    expires_at timestamptz not null,
    verified_at timestamptz,
    consumed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists app_email_verifications_expires_at_idx
    on app_email_verifications (expires_at);

alter table app_email_verifications enable row level security;
alter table app_email_verifications force row level security;

revoke all on app_email_verifications from anon, authenticated;
