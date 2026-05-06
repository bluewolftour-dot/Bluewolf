alter table if exists cms_meta enable row level security;
alter table if exists cms_home_content enable row level security;
alter table if exists cms_community_content enable row level security;
alter table if exists cms_tour_options_content enable row level security;
alter table if exists cms_tour_region_cards_content enable row level security;
alter table if exists cms_tour_customize_content enable row level security;
alter table if exists cms_tour_themes_content enable row level security;
alter table if exists cms_tours enable row level security;
alter table if exists crm_inquiries enable row level security;
alter table if exists crm_bookings enable row level security;
alter table if exists crm_payment_orders enable row level security;
alter table if exists app_users enable row level security;
alter table if exists app_sessions enable row level security;
alter table if exists app_security_events enable row level security;
alter table if exists notifications enable row level security;
alter table if exists reports enable row level security;

alter table if exists cms_meta force row level security;
alter table if exists cms_home_content force row level security;
alter table if exists cms_community_content force row level security;
alter table if exists cms_tour_options_content force row level security;
alter table if exists cms_tour_region_cards_content force row level security;
alter table if exists cms_tour_customize_content force row level security;
alter table if exists cms_tour_themes_content force row level security;
alter table if exists cms_tours force row level security;
alter table if exists crm_inquiries force row level security;
alter table if exists crm_bookings force row level security;
alter table if exists crm_payment_orders force row level security;
alter table if exists app_users force row level security;
alter table if exists app_sessions force row level security;
alter table if exists app_security_events force row level security;
alter table if exists notifications force row level security;
alter table if exists reports force row level security;

drop policy if exists "Public read cms_meta" on cms_meta;
create policy "Public read cms_meta"
on cms_meta
for select
to public
using (true);

drop policy if exists "Public read cms_home_content" on cms_home_content;
create policy "Public read cms_home_content"
on cms_home_content
for select
to public
using (true);

drop policy if exists "Public read cms_community_content" on cms_community_content;
create policy "Public read cms_community_content"
on cms_community_content
for select
to public
using (true);

drop policy if exists "Public read cms_tour_options_content" on cms_tour_options_content;
create policy "Public read cms_tour_options_content"
on cms_tour_options_content
for select
to public
using (true);

drop policy if exists "Public read cms_tour_region_cards_content" on cms_tour_region_cards_content;
create policy "Public read cms_tour_region_cards_content"
on cms_tour_region_cards_content
for select
to public
using (true);

drop policy if exists "Public read cms_tour_customize_content" on cms_tour_customize_content;
create policy "Public read cms_tour_customize_content"
on cms_tour_customize_content
for select
to public
using (true);

drop policy if exists "Public read cms_tour_themes_content" on cms_tour_themes_content;
create policy "Public read cms_tour_themes_content"
on cms_tour_themes_content
for select
to public
using (true);

drop policy if exists "Public read cms_tours" on cms_tours;
create policy "Public read cms_tours"
on cms_tours
for select
to public
using (true);

revoke all on crm_inquiries from anon, authenticated;
revoke all on crm_bookings from anon, authenticated;
revoke all on crm_payment_orders from anon, authenticated;
revoke all on app_users from anon, authenticated;
revoke all on app_sessions from anon, authenticated;
revoke all on app_security_events from anon, authenticated;
revoke all on notifications from anon, authenticated;
revoke all on reports from anon, authenticated;

revoke execute on function bluewolf_finalize_payment_order_with_booking(
    text,
    text,
    integer,
    text,
    text,
    integer,
    integer,
    text,
    text,
    text,
    date,
    integer,
    text,
    text
) from public, anon, authenticated;

grant execute on function bluewolf_finalize_payment_order_with_booking(
    text,
    text,
    integer,
    text,
    text,
    integer,
    integer,
    text,
    text,
    text,
    date,
    integer,
    text,
    text
) to service_role;

revoke execute on function bluewolf_readiness_check() from public, anon, authenticated;
grant execute on function bluewolf_readiness_check() to service_role;
