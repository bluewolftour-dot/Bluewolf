import { readOptionalEnv } from "@/lib/env";
import { supabaseRpcRequest } from "@/lib/supabase-server";

export type SupabaseReadiness = {
    databaseProvider: string;
    uploadProvider: string;
    hasDatabaseUrl: boolean;
    hasSupabaseUrl: boolean;
    hasServiceRoleKey: boolean;
    hasStorageBucket: boolean;
    readyForStorage: boolean;
    readyForAsyncStores: boolean;
    cmsCrmRuntimeProvider: "sqlite" | "supabase";
    readyForCmsCrmDatabase: boolean;
    cmsCrmMigrationReady: boolean | null;
    missing: string[];
};

export async function getSupabaseReadiness(): Promise<SupabaseReadiness> {
    const databaseProvider = readOptionalEnv("BLUEWOLF_DATABASE_PROVIDER") || "sqlite";
    const uploadProvider = readOptionalEnv("BLUEWOLF_UPLOAD_STORAGE_PROVIDER") || "local";
    const hasDatabaseUrl = Boolean(readOptionalEnv("DATABASE_URL"));
    const hasSupabaseUrl = Boolean(readOptionalEnv("SUPABASE_URL"));
    const hasServiceRoleKey = Boolean(readOptionalEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const hasStorageBucket = Boolean(readOptionalEnv("SUPABASE_STORAGE_BUCKET"));
    const missing: string[] = [];
    let cmsCrmMigrationReady: boolean | null = null;

    if (databaseProvider === "supabase" && !hasSupabaseUrl) missing.push("SUPABASE_URL");
    if (databaseProvider === "supabase" && !hasServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (uploadProvider === "supabase" && !hasSupabaseUrl) missing.push("SUPABASE_URL");
    if (uploadProvider === "supabase" && !hasServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (uploadProvider === "supabase" && !hasStorageBucket) missing.push("SUPABASE_STORAGE_BUCKET");

    if (databaseProvider === "supabase" && hasSupabaseUrl && hasServiceRoleKey) {
        try {
            const result = await supabaseRpcRequest<{ ok?: boolean }>("bluewolf_readiness_check", {
                body: {},
            });
            cmsCrmMigrationReady = result.ok === true;
            if (!cmsCrmMigrationReady) missing.push("SUPABASE_MIGRATIONS");
        } catch {
            cmsCrmMigrationReady = false;
            missing.push("SUPABASE_MIGRATIONS");
        }
    }

    return {
        databaseProvider,
        uploadProvider,
        hasDatabaseUrl,
        hasSupabaseUrl,
        hasServiceRoleKey,
        hasStorageBucket,
        readyForStorage:
            uploadProvider !== "supabase" || (hasSupabaseUrl && hasServiceRoleKey && hasStorageBucket),
        readyForAsyncStores: true,
        cmsCrmRuntimeProvider: databaseProvider === "supabase" ? "supabase" : "sqlite",
        readyForCmsCrmDatabase:
            databaseProvider !== "supabase" ||
            (hasSupabaseUrl && hasServiceRoleKey && cmsCrmMigrationReady === true),
        cmsCrmMigrationReady,
        missing: Array.from(new Set(missing)),
    };
}
