import { NextResponse } from "next/server";

export const revalidate = 3600;

type OpenMeteoDaily = {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
};

type OpenMeteoResponse = {
    daily?: OpenMeteoDaily;
};

const WEATHER_API_URL =
    "https://api.open-meteo.com/v1/forecast?latitude=47.9189&longitude=106.917&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FUlaanbaatar&forecast_days=7";

function readNumber(values: number[] | undefined, index: number) {
    const value = values?.[index];
    return Number.isFinite(value) ? value : null;
}

export async function GET() {
    try {
        const response = await fetch(WEATHER_API_URL, { next: { revalidate } });

        if (!response.ok) {
            return NextResponse.json({ ok: false, error: "WEATHER_API_FAILED" }, { status: 502 });
        }

        const data = (await response.json()) as OpenMeteoResponse;
        const daily = data.daily;
        const dates = daily?.time ?? [];
        const days = dates.slice(0, 7).map((date, index) => ({
            date,
            weatherCode: readNumber(daily?.weather_code, index),
            temperatureMax: readNumber(daily?.temperature_2m_max, index),
            temperatureMin: readNumber(daily?.temperature_2m_min, index),
        }));

        return NextResponse.json({
            ok: true,
            location: {
                name: "Ulaanbaatar",
                country: "Mongolia",
                latitude: 47.9189,
                longitude: 106.917,
            },
            source: "Open-Meteo",
            updatedAt: new Date().toISOString(),
            days,
        });
    } catch {
        return NextResponse.json({ ok: false, error: "WEATHER_UNAVAILABLE" }, { status: 500 });
    }
}
