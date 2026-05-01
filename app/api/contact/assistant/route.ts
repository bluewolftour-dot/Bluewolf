import { NextResponse } from "next/server";
import {
    answerContactAssistantQuestion,
    type ContactAssistantMessage,
} from "@/lib/contact-ai";
import { type Locale } from "@/lib/bluewolf-data";

export const runtime = "nodejs";

type ContactAssistantRequest = {
    locale?: Locale;
    messages?: ContactAssistantMessage[];
};

function isLocale(value: string | undefined): value is Locale {
    return value === "ko" || value === "ja" || value === "en";
}

export async function POST(request: Request) {
    const body = (await request.json()) as ContactAssistantRequest;

    if (!isLocale(body.locale)) {
        return NextResponse.json({ error: "INVALID_LOCALE" }, { status: 400 });
    }

    const messages = Array.isArray(body.messages)
        ? body.messages.filter(
              (message): message is ContactAssistantMessage =>
                  Boolean(message?.content?.trim()) &&
                  (message.role === "user" || message.role === "assistant")
          )
        : [];

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
        return NextResponse.json({ error: "INVALID_MESSAGES" }, { status: 400 });
    }

    const answer = answerContactAssistantQuestion(body.locale, messages);

    return NextResponse.json({ answer });
}
