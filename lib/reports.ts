import { randomUUID } from "node:crypto";
import { readJsonListStore, writeJsonListStore } from "@/lib/json-store";
import {
    isSupabaseDatabaseEnabled,
    supabaseInsertOne,
    supabasePatch,
    supabaseRestRequest,
} from "@/lib/supabase-server";

export type ReportType = "spam" | "abuse" | "inappropriate" | "other";

export type Report = {
    id: string;
    userId?: string;
    targetType: "post" | "user" | "other";
    targetId?: string;
    reportType: ReportType;
    content: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: string;
};

const reportsPath = "reports.json";

type SupabaseReportRow = {
    id: string;
    user_id: string | null;
    target_type: Report["targetType"];
    target_id: string | null;
    report_type: ReportType;
    content: string;
    status: Report["status"];
    created_at: string;
};

function toReport(row: SupabaseReportRow): Report {
    return {
        id: row.id,
        userId: row.user_id ?? undefined,
        targetType: row.target_type,
        targetId: row.target_id ?? undefined,
        reportType: row.report_type,
        content: row.content,
        status: row.status,
        createdAt: row.created_at,
    };
}

async function readReports(): Promise<Report[]> {
    return readJsonListStore<Report>(reportsPath);
}

async function writeReports(reports: Report[]) {
    await writeJsonListStore(reportsPath, reports);
}

export async function createReport(input: Omit<Report, "id" | "status" | "createdAt">) {
    if (isSupabaseDatabaseEnabled()) {
        const row = await supabaseInsertOne<SupabaseReportRow>("reports", {
            user_id: input.userId ?? null,
            target_type: input.targetType,
            target_id: input.targetId ?? null,
            report_type: input.reportType,
            content: input.content,
            status: "pending",
        });

        if (!row) {
            throw new Error("Failed to create Supabase report.");
        }

        return toReport(row);
    }

    const reports = await readReports();
    const newReport: Report = {
        id: randomUUID(),
        ...input,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    reports.push(newReport);
    await writeReports(reports);
    return newReport;
}

export async function getReports() {
    if (isSupabaseDatabaseEnabled()) {
        const rows = await supabaseRestRequest<SupabaseReportRow[]>("reports", {
            query: {
                select: "*",
                order: "created_at.desc",
            },
        });
        return rows.map(toReport);
    }

    return await readReports();
}

export async function updateReportStatus(reportId: string, status: Report["status"]) {
    if (isSupabaseDatabaseEnabled()) {
        const rows = await supabasePatch<SupabaseReportRow>(
            "reports",
            { id: `eq.${reportId}` },
            { status }
        );
        return rows.length > 0;
    }

    const reports = await readReports();
    const target = reports.find((r) => r.id === reportId);
    if (target) {
        target.status = status;
        await writeReports(reports);
        return true;
    }
    return false;
}
