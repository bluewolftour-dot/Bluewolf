import { type CrmBookingRecord } from "@/lib/cms-crm-db";

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const ACTIVE_CAPACITY_STATUSES = new Set(["pending", "confirmed", "paid"]);

export type BookingRuleErrorCode =
    | "INVALID_DEPART_DATE"
    | "DEPARTURE_DATE_PAST"
    | "DEPARTURE_DATE_TOO_SOON"
    | "BLACKOUT_DATE"
    | "INVALID_GUESTS"
    | "CAPACITY_EXCEEDED";

export type BookingRuleResult =
    | { ok: true; capacity: number; reservedGuests: number; remainingSeats: number }
    | {
          ok: false;
          code: BookingRuleErrorCode;
          message: string;
          capacity?: number;
          reservedGuests?: number;
          remainingSeats?: number;
      };

function readPositiveIntEnv(name: string, fallback: number) {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function getBookingDailyCapacity() {
    return readPositiveIntEnv("BOOKING_DAILY_CAPACITY", 12);
}

export function getBookingMinLeadDays() {
    return readPositiveIntEnv("BOOKING_MIN_LEAD_DAYS", 3);
}

function getBlackoutDates() {
    return new Set(
        (process.env.BOOKING_BLACKOUT_DATES ?? "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
    );
}

function parseDateOnly(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const time = Date.UTC(year, month - 1, day);
    const parsed = new Date(time);

    if (
        parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() !== month - 1 ||
        parsed.getUTCDate() !== day
    ) {
        return null;
    }

    return { value: `${match[1]}-${match[2]}-${match[3]}`, time };
}

function getTodayKstUtcTime() {
    const nowKst = new Date(Date.now() + KST_OFFSET_MS);
    return Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate());
}

export function getBookingRuleMessage(code: BookingRuleErrorCode) {
    if (code === "INVALID_DEPART_DATE") return "올바른 출발일을 선택해주세요.";
    if (code === "DEPARTURE_DATE_PAST") return "지난 날짜는 출발일로 선택할 수 없습니다.";
    if (code === "DEPARTURE_DATE_TOO_SOON") {
        return `출발일은 최소 ${getBookingMinLeadDays()}일 이후부터 선택할 수 있습니다.`;
    }
    if (code === "BLACKOUT_DATE") return "해당 날짜는 예약이 불가능한 출발 제한일입니다.";
    if (code === "INVALID_GUESTS") return "예약 인원을 다시 확인해주세요.";
    return "선택한 날짜의 남은 정원이 부족합니다.";
}

export function validateDepartDate(departDate: string): BookingRuleResult {
    const parsed = parseDateOnly(departDate);
    if (!parsed) {
        return { ok: false, code: "INVALID_DEPART_DATE", message: getBookingRuleMessage("INVALID_DEPART_DATE") };
    }

    const today = getTodayKstUtcTime();
    if (parsed.time < today) {
        return { ok: false, code: "DEPARTURE_DATE_PAST", message: getBookingRuleMessage("DEPARTURE_DATE_PAST") };
    }

    const minDepartTime = today + getBookingMinLeadDays() * DAY_MS;
    if (parsed.time < minDepartTime) {
        return {
            ok: false,
            code: "DEPARTURE_DATE_TOO_SOON",
            message: getBookingRuleMessage("DEPARTURE_DATE_TOO_SOON"),
        };
    }

    if (getBlackoutDates().has(parsed.value)) {
        return { ok: false, code: "BLACKOUT_DATE", message: getBookingRuleMessage("BLACKOUT_DATE") };
    }

    return { ok: true, capacity: getBookingDailyCapacity(), reservedGuests: 0, remainingSeats: getBookingDailyCapacity() };
}

export function validateBookingAvailability(input: {
    tourId: number;
    departDate: string;
    guests: number;
    bookings: CrmBookingRecord[];
}) {
    const dateResult = validateDepartDate(input.departDate);
    if (!dateResult.ok) return dateResult;

    const capacity = getBookingDailyCapacity();
    if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > capacity) {
        return {
            ok: false as const,
            code: "INVALID_GUESTS" as const,
            message: getBookingRuleMessage("INVALID_GUESTS"),
            capacity,
            reservedGuests: 0,
            remainingSeats: capacity,
        };
    }

    const reservedGuests = input.bookings
        .filter(
            (booking) =>
                booking.tourId === input.tourId &&
                booking.departDate === input.departDate &&
                ACTIVE_CAPACITY_STATUSES.has(booking.status)
        )
        .reduce((sum, booking) => sum + Math.max(0, Number(booking.guests) || 0), 0);
    const remainingSeats = Math.max(0, capacity - reservedGuests);

    if (input.guests > remainingSeats) {
        return {
            ok: false as const,
            code: "CAPACITY_EXCEEDED" as const,
            message: getBookingRuleMessage("CAPACITY_EXCEEDED"),
            capacity,
            reservedGuests,
            remainingSeats,
        };
    }

    return { ok: true as const, capacity, reservedGuests, remainingSeats };
}
