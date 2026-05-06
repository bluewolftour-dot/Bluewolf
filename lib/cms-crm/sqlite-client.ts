import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type DatabaseRunResult = {
    lastInsertRowid?: number | bigint;
    changes?: number;
};

export type Statement = {
    run: (...params: unknown[]) => DatabaseRunResult;
    get: (...params: unknown[]) => Record<string, unknown> | undefined;
    all: (...params: unknown[]) => Record<string, unknown>[];
};

export type Database = {
    exec: (sql: string) => void;
    prepare: (sql: string) => Statement;
};

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "bluewolf.sqlite");
const initLockPath = path.join(dbDir, ".bluewolf-sqlite-init-lock");

let sqliteDatabase: Database | null = null;

function sleepSync(ms: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function getSqliteDatabase() {
    if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
    }

    if (!sqliteDatabase) {
        sqliteDatabase = new DatabaseSync(dbPath) as unknown as Database;
        sqliteDatabase.exec(`
            PRAGMA journal_mode = WAL;
            PRAGMA busy_timeout = 5000;
        `);
    }

    return sqliteDatabase;
}

export function withSqliteInitLock(run: () => void) {
    const waitDeadline = Date.now() + 5000;

    while (true) {
        try {
            mkdirSync(initLockPath);

            try {
                run();
            } finally {
                rmSync(initLockPath, { recursive: true, force: true });
            }

            return;
        } catch (error) {
            const isLockContention =
                error instanceof Error &&
                "code" in error &&
                error.code === "EEXIST";

            if (!isLockContention) {
                throw error;
            }

            if (Date.now() >= waitDeadline) {
                throw new Error("Timed out while waiting for CMS database initialization lock.");
            }

            sleepSync(50);
        }
    }
}

export function ensureSqliteColumn(db: Database, table: string, column: string, definition: string) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = columns.some((item) => String(item.name) === column);
    if (!exists) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}
