create or replace function bluewolf_finalize_payment_order_with_booking(
    p_order_id text,
    p_payment_key text,
    p_tour_id integer,
    p_custom_title text default '',
    p_custom_summary text default '',
    p_total_amount integer default 0,
    p_deposit_amount integer default 0,
    p_customer_name text default '',
    p_email text default '',
    p_phone text default '',
    p_depart_date date default current_date,
    p_guests integer default 1,
    p_locale text default 'ko',
    p_status text default 'pending'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order crm_payment_orders%rowtype;
    v_booking crm_bookings%rowtype;
    v_booking_no text;
    v_stamp text := to_char(now() at time zone 'utc', 'YYYYMMDD');
    v_suffix integer;
    v_status text := case
        when p_status in ('pending', 'confirmed', 'paid', 'completed', 'cancelled') then p_status
        else 'pending'
    end;
begin
    select *
    into v_order
    from crm_payment_orders
    where order_id = btrim(p_order_id)
    for update;

    if not found then
        return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND');
    end if;

    if v_order.status = 'paid' and v_order.booking_no is not null then
        select *
        into v_booking
        from crm_bookings
        where booking_no = v_order.booking_no;

        if found then
            return jsonb_build_object(
                'ok', true,
                'alreadyProcessed', true,
                'booking', to_jsonb(v_booking)
            );
        end if;
    end if;

    if v_order.status <> 'ready' then
        return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_PAYABLE');
    end if;

    loop
        v_suffix := floor(1000 + random() * 9000)::integer;
        v_booking_no := 'BW-' || v_stamp || '-' || v_suffix::text;

        begin
            insert into crm_bookings (
                booking_no,
                tour_id,
                custom_title,
                custom_summary,
                total_amount,
                deposit_amount,
                customer_name,
                email,
                phone,
                depart_date,
                guests,
                locale,
                status
            )
            values (
                v_booking_no,
                p_tour_id,
                coalesce(btrim(p_custom_title), ''),
                coalesce(btrim(p_custom_summary), ''),
                greatest(0, coalesce(p_total_amount, 0)),
                greatest(0, coalesce(p_deposit_amount, 0)),
                btrim(p_customer_name),
                lower(btrim(p_email)),
                btrim(p_phone),
                p_depart_date,
                greatest(1, coalesce(p_guests, 1)),
                coalesce(nullif(btrim(p_locale), ''), 'ko'),
                v_status
            )
            returning * into v_booking;

            exit;
        exception
            when unique_violation then
                -- Retry booking number generation if the random suffix collides.
        end;
    end loop;

    update crm_payment_orders
    set
        status = 'paid',
        payment_key = btrim(p_payment_key),
        booking_no = v_booking.booking_no,
        approved_at = now()
    where order_id = v_order.order_id;

    return jsonb_build_object(
        'ok', true,
        'alreadyProcessed', false,
        'booking', to_jsonb(v_booking)
    );
end;
$$;

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

create or replace function bluewolf_readiness_check()
returns jsonb
language sql
security definer
set search_path = public
as $$
    select jsonb_build_object(
        'ok', true,
        'cmsTourCount', (select count(*) from cms_tours),
        'checkedAt', now()
    );
$$;

grant execute on function bluewolf_readiness_check() to service_role;
