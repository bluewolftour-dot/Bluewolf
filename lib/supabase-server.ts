import { readOptionalEnv, readRequiredEnv } from "@/lib/env";

type SupabaseRequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, string>;
    body?: unknown;
    prefer?: string;
};

type SupabaseRpcOptions = {
    body?: unknown;
};

function getSupabaseBaseUrl() {
    return readRequiredEnv("SUPABASE_URL").replace(/\/+$/, "");
}

function getSupabaseServiceRoleKey() {
    return readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function isSupabaseDatabaseEnabled() {
    return readOptionalEnv("BLUEWOLF_DATABASE_PROVIDER") === "supabase";
}

export async function supabaseRestRequest<T>(
    table: string,
    options: SupabaseRequestOptions = {}
): Promise<T> {
    const url = new URL(`${getSupabaseBaseUrl()}/rest/v1/${table}`);
    Object.entries(options.query ?? {}).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const serviceRoleKey = getSupabaseServiceRoleKey();
    const response = await fetch(url, {
        method: options.method ?? "GET",
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            ...(options.prefer ? { Prefer: options.prefer } : {}),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(`Supabase request failed: ${response.status} ${message}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export async function supabaseRpcRequest<T>(
    functionName: string,
    options: SupabaseRpcOptions = {}
): Promise<T> {
    const url = new URL(`${getSupabaseBaseUrl()}/rest/v1/rpc/${functionName}`);
    const serviceRoleKey = getSupabaseServiceRoleKey();
    const response = await fetch(url, {
        method: "POST",
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(`Supabase RPC failed: ${response.status} ${message}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export async function supabaseSelectOne<T>(
    table: string,
    query: Record<string, string>
) {
    const rows = await supabaseRestRequest<T[]>(table, {
        query: {
            ...query,
            select: "*",
            limit: "1",
        },
    });

    return rows[0] ?? null;
}

export async function supabaseInsertOne<T>(table: string, body: unknown) {
    const rows = await supabaseRestRequest<T[]>(table, {
        method: "POST",
        body,
        prefer: "return=representation",
    });
    return rows[0] ?? null;
}

export async function supabasePatch<T>(
    table: string,
    query: Record<string, string>,
    body: unknown
) {
    return supabaseRestRequest<T[]>(table, {
        method: "PATCH",
        query: {
            ...query,
            select: "*",
        },
        body,
        prefer: "return=representation",
    });
}

export async function supabaseUpsertOne<T>(
    table: string,
    body: unknown,
    conflictTarget: string
) {
    const rows = await supabaseRestRequest<T[]>(table, {
        method: "POST",
        query: {
            on_conflict: conflictTarget,
        },
        body,
        prefer: "resolution=merge-duplicates,return=representation",
    });
    return rows[0] ?? null;
}

export async function supabaseDelete(table: string, query: Record<string, string>) {
    await supabaseRestRequest<void>(table, {
        method: "DELETE",
        query,
    });
}
