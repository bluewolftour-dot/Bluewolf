create table if not exists cms_meta (
    key text primary key,
    value text not null
);

create table if not exists cms_home_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_community_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_tour_options_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_tour_region_cards_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_tour_customize_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_tour_themes_content (
    id integer primary key check (id = 1),
    content jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists cms_tours (
    id integer primary key,
    region text not null,
    theme text not null,
    duration_type text not null,
    price integer not null check (price >= 0),
    deposit integer not null check (deposit >= 0),
    gradient text not null,
    hero_image text not null,
    images jsonb not null default '[]'::jsonb,
    detail_images jsonb not null default '[]'::jsonb,
    title jsonb not null,
    description jsonb not null,
    tags jsonb not null default '{"ko":[],"ja":[],"en":[]}'::jsonb,
    tag_colors jsonb not null default '{"ko":{},"ja":{},"en":{}}'::jsonb,
    duration jsonb not null,
    highlights jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_inquiries (
    id bigserial primary key,
    name text not null,
    email text not null,
    phone text not null,
    subject text not null,
    message text not null,
    locale text not null default 'ko',
    status text not null default 'new',
    created_at timestamptz not null default now(),
    constraint crm_inquiries_status_check check (status in ('new', 'checking', 'answered', 'closed'))
);

create table if not exists crm_bookings (
    id bigserial primary key,
    booking_no text not null unique,
    tour_id integer not null,
    custom_title text not null default '',
    custom_summary text not null default '',
    total_amount integer not null default 0 check (total_amount >= 0),
    deposit_amount integer not null default 0 check (deposit_amount >= 0),
    customer_name text not null,
    email text not null default '',
    phone text not null,
    depart_date date not null,
    guests integer not null check (guests > 0),
    locale text not null default 'ko',
    status text not null default 'confirmed',
    cancel_reason text,
    cancel_memo text,
    created_at timestamptz not null default now(),
    constraint crm_bookings_status_check check (status in ('pending', 'confirmed', 'paid', 'completed', 'cancelled'))
);

create index if not exists crm_bookings_email_idx on crm_bookings (lower(email));
create index if not exists crm_bookings_departure_idx on crm_bookings (tour_id, depart_date, status);

create table if not exists crm_payment_orders (
    id bigserial primary key,
    order_id text not null unique,
    tour_id integer not null,
    custom_title text not null default '',
    custom_summary text not null default '',
    total_amount integer not null default 0 check (total_amount >= 0),
    customer_name text not null,
    email text not null default '',
    phone text not null,
    depart_date date not null,
    guests integer not null check (guests > 0),
    locale text not null default 'ko',
    payment_method text not null,
    option_keys jsonb not null default '[]'::jsonb,
    memo text not null default '',
    amount integer not null check (amount > 0),
    status text not null default 'ready',
    payment_key text,
    booking_no text references crm_bookings (booking_no),
    created_at timestamptz not null default now(),
    approved_at timestamptz,
    constraint crm_payment_orders_status_check check (status in ('ready', 'paid', 'cancelled'))
);

create index if not exists crm_payment_orders_booking_no_idx on crm_payment_orders (booking_no);
create index if not exists crm_payment_orders_email_idx on crm_payment_orders (lower(email));

create table if not exists app_users (
    id text primary key,
    name text not null,
    phone text not null,
    email text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now()
);

create table if not exists app_sessions (
    token text primary key,
    user_id text not null references app_users (id) on delete cascade,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create index if not exists app_sessions_user_id_idx on app_sessions (user_id);
create index if not exists app_sessions_expires_at_idx on app_sessions (expires_at);

create table if not exists app_security_events (
    key text primary key,
    scope text not null,
    count integer not null default 0,
    reset_at timestamptz not null,
    blocked_until timestamptz,
    locked_until timestamptz
);

create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references app_users (id) on delete cascade,
    type text not null,
    title jsonb not null,
    content jsonb not null,
    link text,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx on notifications (user_id, created_at desc);

create table if not exists reports (
    id uuid primary key default gen_random_uuid(),
    user_id text references app_users (id) on delete set null,
    target_type text not null,
    target_id text,
    report_type text not null,
    content text not null,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    constraint reports_status_check check (status in ('pending', 'resolved', 'dismissed'))
);

create index if not exists reports_status_created_at_idx on reports (status, created_at desc);
