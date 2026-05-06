import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const rootDir = process.cwd();
const dbPath = path.join(rootDir, "data", "bluewolf.sqlite");
const authDir = path.join(rootDir, "data", "auth");
const defaultOutputPath = path.join(rootDir, "supabase", "seed", "bluewolf-seed.sql");

const args = new Set(process.argv.slice(2));
const includeSensitive = args.has("--include-sensitive");
const includeAuth = args.has("--include-auth");
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const outputPath = outputArg ? path.resolve(rootDir, outputArg.slice("--output=".length)) : defaultOutputPath;

if (!existsSync(dbPath)) {
    throw new Error(`SQLite database not found: ${dbPath}`);
}

const db = new DatabaseSync(dbPath);

function rows(sql) {
    return db.prepare(sql).all();
}

function sqlValue(value) {
    if (value === null || value === undefined) return "null";
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlJson(value) {
    if (value === null || value === undefined || value === "") return "'{}'::jsonb";
    return `${sqlValue(value)}::jsonb`;
}

function sqlDate(value) {
    return value ? sqlValue(String(value).slice(0, 10)) : "null";
}

function insertStatement(table, columns, values, conflictTarget) {
    const columnSql = columns.join(", ");
    const valueSql = values.join(", ");
    const updateSql = columns
        .filter((column) => !conflictTarget.includes(column))
        .map((column) => `${column} = excluded.${column}`)
        .join(", ");

    return [
        `insert into ${table} (${columnSql})`,
        `values (${valueSql})`,
        `on conflict (${conflictTarget.join(", ")}) do update set ${updateSql};`,
    ].join("\n");
}

function readJsonFile(filePath) {
    if (!existsSync(filePath)) return [];
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
}

const statements = [
    "-- Bluewolf Supabase seed generated from local SQLite/JSON stores.",
    "-- Apply migrations before running this seed.",
    "-- By default this file excludes CRM, payment, and auth data.",
    "begin;",
];

for (const row of rows("select * from cms_home_content")) {
    statements.push(
        insertStatement(
            "cms_home_content",
            ["id", "content", "updated_at"],
            [sqlValue(row.id), sqlJson(row.content), sqlValue(row.updatedAt)],
            ["id"]
        )
    );
}

for (const row of rows("select * from cms_community_content")) {
    statements.push(
        insertStatement(
            "cms_community_content",
            ["id", "content", "updated_at"],
            [sqlValue(row.id), sqlJson(row.content), sqlValue(row.updatedAt)],
            ["id"]
        )
    );
}

const singletonTables = [
    ["cms_tour_options_content", "cms_tour_options_content"],
    ["cms_tour_region_cards_content", "cms_tour_region_cards_content"],
    ["cms_tour_customize_content", "cms_tour_customize_content"],
    ["cms_tour_themes_content", "cms_tour_themes_content"],
];

for (const [sqliteTable, postgresTable] of singletonTables) {
    for (const row of rows(`select * from ${sqliteTable}`)) {
        statements.push(
            insertStatement(
                postgresTable,
                ["id", "content", "updated_at"],
                [sqlValue(row.id), sqlJson(row.content), sqlValue(row.updatedAt)],
                ["id"]
            )
        );
    }
}

for (const row of rows("select * from cms_tours order by id")) {
    statements.push(
        insertStatement(
            "cms_tours",
            [
                "id",
                "region",
                "theme",
                "duration_type",
                "price",
                "deposit",
                "gradient",
                "hero_image",
                "images",
                "detail_images",
                "title",
                "description",
                "tags",
                "tag_colors",
                "duration",
                "highlights",
                "created_at",
                "updated_at",
            ],
            [
                sqlValue(row.id),
                sqlValue(row.region),
                sqlValue(row.theme),
                sqlValue(row.durationType),
                sqlValue(row.price),
                sqlValue(row.deposit),
                sqlValue(row.gradient),
                sqlValue(row.heroImage),
                sqlJson(row.images),
                sqlJson(row.detailImages),
                sqlJson(row.title),
                sqlJson(row.desc),
                sqlJson(row.tags),
                sqlJson(row.tagColors),
                sqlJson(row.duration),
                sqlJson(row.highlights),
                sqlValue(row.createdAt),
                sqlValue(row.updatedAt),
            ],
            ["id"]
        )
    );
}

if (includeSensitive) {
    for (const row of rows("select * from crm_inquiries order by id")) {
        statements.push(
            insertStatement(
                "crm_inquiries",
                ["id", "name", "email", "phone", "subject", "message", "locale", "status", "created_at"],
                [
                    sqlValue(row.id),
                    sqlValue(row.name),
                    sqlValue(row.email),
                    sqlValue(row.phone),
                    sqlValue(row.subject),
                    sqlValue(row.message),
                    sqlValue(row.locale),
                    sqlValue(row.status),
                    sqlValue(row.createdAt),
                ],
                ["id"]
            )
        );
    }

    for (const row of rows("select * from crm_bookings order by id")) {
        statements.push(
            insertStatement(
                "crm_bookings",
                [
                    "id",
                    "booking_no",
                    "tour_id",
                    "custom_title",
                    "custom_summary",
                    "total_amount",
                    "deposit_amount",
                    "customer_name",
                    "email",
                    "phone",
                    "depart_date",
                    "guests",
                    "locale",
                    "status",
                    "cancel_reason",
                    "cancel_memo",
                    "created_at",
                ],
                [
                    sqlValue(row.id),
                    sqlValue(row.bookingNo),
                    sqlValue(row.tourId),
                    sqlValue(row.customTitle ?? ""),
                    sqlValue(row.customSummary ?? ""),
                    sqlValue(row.totalAmount ?? 0),
                    sqlValue(row.depositAmount ?? 0),
                    sqlValue(row.customerName),
                    sqlValue(row.email ?? ""),
                    sqlValue(row.phone),
                    sqlDate(row.departDate),
                    sqlValue(row.guests),
                    sqlValue(row.locale),
                    sqlValue(row.status),
                    sqlValue(row.cancelReason),
                    sqlValue(row.cancelMemo),
                    sqlValue(row.createdAt),
                ],
                ["booking_no"]
            )
        );
    }

    for (const row of rows("select * from crm_payment_orders order by id")) {
        statements.push(
            insertStatement(
                "crm_payment_orders",
                [
                    "id",
                    "order_id",
                    "tour_id",
                    "custom_title",
                    "custom_summary",
                    "total_amount",
                    "customer_name",
                    "email",
                    "phone",
                    "depart_date",
                    "guests",
                    "locale",
                    "payment_method",
                    "option_keys",
                    "memo",
                    "amount",
                    "status",
                    "payment_key",
                    "booking_no",
                    "created_at",
                    "approved_at",
                ],
                [
                    sqlValue(row.id),
                    sqlValue(row.orderId),
                    sqlValue(row.tourId),
                    sqlValue(row.customTitle ?? ""),
                    sqlValue(row.customSummary ?? ""),
                    sqlValue(row.totalAmount ?? 0),
                    sqlValue(row.customerName),
                    sqlValue(row.email ?? ""),
                    sqlValue(row.phone),
                    sqlDate(row.departDate),
                    sqlValue(row.guests),
                    sqlValue(row.locale),
                    sqlValue(row.paymentMethod),
                    sqlJson(row.optionKeys),
                    sqlValue(row.memo ?? ""),
                    sqlValue(row.amount),
                    sqlValue(row.status),
                    sqlValue(row.paymentKey),
                    sqlValue(row.bookingNo),
                    sqlValue(row.createdAt),
                    sqlValue(row.approvedAt),
                ],
                ["order_id"]
            )
        );
    }
}

if (includeAuth) {
    const users = readJsonFile(path.join(authDir, "users.json"));
    const sessions = readJsonFile(path.join(authDir, "sessions.json"));

    for (const user of users) {
        statements.push(
            insertStatement(
                "app_users",
                ["id", "name", "phone", "email", "password_hash", "created_at"],
                [
                    sqlValue(user.id),
                    sqlValue(user.name),
                    sqlValue(user.phone),
                    sqlValue(user.email),
                    sqlValue(user.passwordHash),
                    sqlValue(user.createdAt),
                ],
                ["id"]
            )
        );
    }

    for (const session of sessions) {
        const expiresAt = new Date(new Date(session.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        statements.push(
            insertStatement(
                "app_sessions",
                ["token", "user_id", "created_at", "expires_at"],
                [sqlValue(session.token), sqlValue(session.userId), sqlValue(session.createdAt), sqlValue(expiresAt)],
                ["token"]
            )
        );
    }
}

statements.push("commit;");

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n\n")}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
console.log(includeSensitive ? "Included CRM/payment data." : "Skipped CRM/payment data. Use --include-sensitive to include it.");
console.log(includeAuth ? "Included auth users/sessions." : "Skipped auth data. Use --include-auth to include it.");
