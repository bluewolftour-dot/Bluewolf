
import { tours, type Tour } from "@/lib/bluewolf-data";
import { normalizeCmsTourImages } from "@/lib/cms-image";
import { defaultCmsHomeContent, normalizeCmsHomeContent, type CmsHomeContent } from "@/lib/cms-home";
import {
    defaultCmsCommunityContent,
    normalizeCmsCommunityContent,
    type CmsCommunityContent,
} from "@/lib/cms-community";
import {
    defaultCmsTourOptionsContent,
    normalizeCmsTourOptionsContent,
    type CmsTourOptionsContent,
} from "@/lib/cms-tour-options";
import {
    defaultCmsTourRegionCardsContent,
    normalizeCmsTourRegionCardsContent,
    type CmsTourRegionCardsContent,
} from "@/lib/cms-tour-region-cards";
import {
    defaultCmsTourCustomizeContent,
    normalizeCmsTourCustomizeContent,
    type CmsTourCustomizeContent,
} from "@/lib/cms-tour-customize";
import {
    defaultCmsTourThemesContent,
    normalizeCmsTourThemesContent,
    type CmsTourThemesContent,
} from "@/lib/cms-tour-themes";
import {
    ensureSqliteColumn,
    getSqliteDatabase,
    withSqliteInitLock,
    type Database,
} from "@/lib/cms-crm/sqlite-client";
import type {
    CmsCommunityRecord,
    CmsHomeRecord,
    CmsTourCustomizeRecord,
    CmsTourOptionsRecord,
    CmsTourRecord,
    CmsTourRegionCardsRecord,
    CmsTourThemesRecord,
    CrmBookingRecord,
    CrmInquiryRecord,
    CrmPaymentOrderRecord,
} from "@/lib/cms-crm/types";
export type {
    CmsCommunityRecord,
    CmsHomeRecord,
    CmsTourCustomizeRecord,
    CmsTourOptionsRecord,
    CmsTourRecord,
    CmsTourRegionCardsRecord,
    CmsTourThemesRecord,
    CrmBookingRecord,
    CrmInquiryRecord,
    CrmPaymentOrderRecord,
} from "@/lib/cms-crm/types";

let needsBootstrap = true;
function bootstrapIfNeeded(target: Database) {
    if (!needsBootstrap) return;
    needsBootstrap = false;
    const existing = target.prepare("SELECT value FROM cms_meta WHERE key = ?").get("full-init-complete");
    if (!existing) {
        initDb();
    }
}

const db = new Proxy({} as Database, {
    get(_target, prop) {
        const target = getSqliteDatabase();
        bootstrapIfNeeded(target);
        const value = Reflect.get(target, prop);
        return typeof value === "function" ? value.bind(target) : value;
    },
});

function serializeTour(tour: Tour) {
    const normalizedTour = normalizeCmsTourImages(tour);
    return {
        ...normalizedTour,
        title: JSON.stringify(normalizedTour.title),
        desc: JSON.stringify(normalizedTour.desc),
        tags: JSON.stringify(normalizedTour.tags),
        tagColors: JSON.stringify(normalizedTour.tagColors ?? { ko: {}, ja: {}, en: {} }),
        duration: JSON.stringify(normalizedTour.duration),
        highlights: JSON.stringify(normalizedTour.highlights),
        images: JSON.stringify(normalizedTour.images),
        detailImages: JSON.stringify(normalizedTour.detailImages),
    };
}

function deserializeTour(row: Record<string, unknown>): CmsTourRecord {
    return normalizeCmsTourImages({
        id: Number(row.id),
        region: String(row.region) as Tour["region"],
        theme: String(row.theme) as Tour["theme"],
        durationType: String(row.durationType) as Tour["durationType"],
        price: Number(row.price),
        deposit: Number(row.deposit),
        gradient: String(row.gradient),
        heroImage: String(row.heroImage),
        images: JSON.parse(String(row.images)) as string[],
        detailImages: JSON.parse(String(row.detailImages)) as string[],
        title: JSON.parse(String(row.title)) as Tour["title"],
        desc: JSON.parse(String(row.desc)) as Tour["desc"],
        tags: JSON.parse(String(row.tags)) as Tour["tags"],
        tagColors: row.tagColors ? JSON.parse(String(row.tagColors)) as Tour["tagColors"] : { ko: {}, ja: {}, en: {} },
        duration: JSON.parse(String(row.duration)) as Tour["duration"],
        highlights: JSON.parse(String(row.highlights)) as Tour["highlights"],
    });
}

function insertCmsTours(seedTours: Tour[]) {
    const insertTour = db.prepare(`
        INSERT INTO cms_tours (
            id, region, theme, durationType, price, deposit, gradient, heroImage,
            images, detailImages, title, desc, tags, tagColors, duration, highlights, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    seedTours.forEach((tour) => {
        const serialized = serializeTour(tour);
        insertTour.run(
            serialized.id,
            serialized.region,
            serialized.theme,
            serialized.durationType,
            serialized.price,
            serialized.deposit,
            serialized.gradient,
            serialized.heroImage,
            serialized.images,
            serialized.detailImages,
            serialized.title,
            serialized.desc,
            serialized.tags,
            serialized.tagColors,
            serialized.duration,
            serialized.highlights,
            now,
            now
        );
    });
}

function initDb() {
    withSqliteInitLock(() => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS cms_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_home_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_community_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_tour_options_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_tour_region_cards_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_tour_customize_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_tour_themes_content (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                content TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cms_tours (
                id INTEGER PRIMARY KEY,
                region TEXT NOT NULL,
                theme TEXT NOT NULL,
                durationType TEXT NOT NULL,
                price INTEGER NOT NULL,
                deposit INTEGER NOT NULL,
                gradient TEXT NOT NULL,
                heroImage TEXT NOT NULL,
                images TEXT NOT NULL,
                detailImages TEXT NOT NULL,
                title TEXT NOT NULL,
                desc TEXT NOT NULL,
                tags TEXT NOT NULL,
                tagColors TEXT NOT NULL DEFAULT '{"ko":{},"ja":{},"en":{}}',
                duration TEXT NOT NULL,
                highlights TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS crm_inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                locale TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                createdAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS crm_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bookingNo TEXT NOT NULL UNIQUE,
                tourId INTEGER NOT NULL,
                customTitle TEXT NOT NULL DEFAULT '',
                customSummary TEXT NOT NULL DEFAULT '',
                totalAmount INTEGER NOT NULL DEFAULT 0,
                depositAmount INTEGER NOT NULL DEFAULT 0,
                customerName TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL,
                departDate TEXT NOT NULL,
                guests INTEGER NOT NULL,
                locale TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'confirmed',
                cancelReason TEXT,
                cancelMemo TEXT,
                createdAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS crm_payment_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId TEXT NOT NULL UNIQUE,
                tourId INTEGER NOT NULL,
                customTitle TEXT NOT NULL DEFAULT '',
                customSummary TEXT NOT NULL DEFAULT '',
                totalAmount INTEGER NOT NULL DEFAULT 0,
                customerName TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL,
                departDate TEXT NOT NULL,
                guests INTEGER NOT NULL,
                locale TEXT NOT NULL,
                paymentMethod TEXT NOT NULL,
                optionKeys TEXT NOT NULL,
                memo TEXT NOT NULL,
                amount INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'ready',
                paymentKey TEXT,
                bookingNo TEXT,
                createdAt TEXT NOT NULL,
                approvedAt TEXT
            );
        `);

        ensureSqliteColumn(db, "crm_bookings", "email", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_bookings", "customTitle", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_bookings", "customSummary", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_bookings", "totalAmount", "INTEGER NOT NULL DEFAULT 0");
        ensureSqliteColumn(db, "crm_bookings", "depositAmount", "INTEGER NOT NULL DEFAULT 0");
        ensureSqliteColumn(db, "cms_tours", "tagColors", "TEXT NOT NULL DEFAULT '{\"ko\":{},\"ja\":{},\"en\":{}}'");
        ensureSqliteColumn(db, "crm_payment_orders", "email", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_payment_orders", "customTitle", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_payment_orders", "customSummary", "TEXT NOT NULL DEFAULT ''");
        ensureSqliteColumn(db, "crm_payment_orders", "totalAmount", "INTEGER NOT NULL DEFAULT 0");

        const countRow = db.prepare("SELECT COUNT(*) as count FROM cms_tours").get();
        const tourCount = Number(countRow?.count ?? 0);
        const homeCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_home_content").get();
        const homeCount = Number(homeCountRow?.count ?? 0);
        const communityCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_community_content").get();
        const communityCount = Number(communityCountRow?.count ?? 0);
        const tourOptionsCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_tour_options_content").get();
        const tourOptionsCount = Number(tourOptionsCountRow?.count ?? 0);
        const tourRegionCardsCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_tour_region_cards_content").get();
        const tourRegionCardsCount = Number(tourRegionCardsCountRow?.count ?? 0);
        const tourCustomizeCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_tour_customize_content").get();
        const tourCustomizeCount = Number(tourCustomizeCountRow?.count ?? 0);
        const tourThemesCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_tour_themes_content").get();
        const tourThemesCount = Number(tourThemesCountRow?.count ?? 0);

        if (homeCount === 0) {
            db.prepare(`
                INSERT INTO cms_home_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsHomeContent), new Date().toISOString());
        }

        if (communityCount === 0) {
            db.prepare(`
                INSERT INTO cms_community_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsCommunityContent), new Date().toISOString());
        }

        if (tourOptionsCount === 0) {
            db.prepare(`
                INSERT INTO cms_tour_options_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsTourOptionsContent), new Date().toISOString());
        }

        if (tourRegionCardsCount === 0) {
            db.prepare(`
                INSERT INTO cms_tour_region_cards_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsTourRegionCardsContent), new Date().toISOString());
        }

        if (tourCustomizeCount === 0) {
            db.prepare(`
                INSERT INTO cms_tour_customize_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsTourCustomizeContent), new Date().toISOString());
        }

        if (tourThemesCount === 0) {
            db.prepare(`
                INSERT INTO cms_tour_themes_content (id, content, updatedAt)
                VALUES (1, ?, ?)
            `).run(JSON.stringify(defaultCmsTourThemesContent), new Date().toISOString());
        }

        if (tourCount === 0) {
            insertCmsTours(tours);
        }

        const westBackfillRow = db.prepare("SELECT value FROM cms_meta WHERE key = ?").get("west-region-backfill-v1");
        if (!westBackfillRow) {
            const westCountRow = db.prepare("SELECT COUNT(*) as count FROM cms_tours WHERE region = 'west'").get();
            const westCount = Number(westCountRow?.count ?? 0);

            if (westCount === 0) {
                const existingIds = new Set(
                    db.prepare("SELECT id FROM cms_tours").all().map((row) => Number(row.id))
                );

                insertCmsTours(
                    tours.filter((tour) => tour.region === "west" && !existingIds.has(tour.id))
                );
            }

            db.prepare(`
                INSERT INTO cms_meta (key, value)
                VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            `).run("west-region-backfill-v1", new Date().toISOString());
        }

        const defaultToursBackfillRow = db.prepare("SELECT value FROM cms_meta WHERE key = ?").get("default-tour-backfill-v2");
        if (!defaultToursBackfillRow) {
            const existingIds = new Set(
                db.prepare("SELECT id FROM cms_tours").all().map((row) => Number(row.id))
            );
            const missingSeedTours = tours.filter((tour) => tour.id >= 13 && !existingIds.has(tour.id));

            if (missingSeedTours.length > 0) {
                insertCmsTours(missingSeedTours);
            }

            db.prepare(`
                INSERT INTO cms_meta (key, value)
                VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            `).run("default-tour-backfill-v2", new Date().toISOString());
        }

        const bookingCountRow = db.prepare("SELECT COUNT(*) as count FROM crm_bookings").get();
        const bookingCount = Number(bookingCountRow?.count ?? 0);

        if (bookingCount === 0) {
            db.prepare(`
                INSERT INTO crm_bookings (
                    bookingNo, tourId, customerName, phone, departDate, guests, locale, status, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                "BW-2026-0001",
                1,
                "김여행",
                "010-1234-5678",
                "2026-08-15",
                2,
                "ko",
                "confirmed",
                new Date().toISOString()
            );
        }

        db.exec(`
            UPDATE crm_bookings
            SET totalAmount = (
                    SELECT cms_tours.price * crm_bookings.guests
                    FROM cms_tours
                    WHERE cms_tours.id = crm_bookings.tourId
                ),
                depositAmount = (
                    SELECT cms_tours.deposit * crm_bookings.guests
                    FROM cms_tours
                    WHERE cms_tours.id = crm_bookings.tourId
                )
            WHERE (totalAmount = 0 OR depositAmount = 0)
                AND EXISTS (
                    SELECT 1
                    FROM cms_tours
                    WHERE cms_tours.id = crm_bookings.tourId
                );
        `);
        
        // 전체 초기화 완료 플래그 저장
        db.prepare(`
            INSERT INTO cms_meta (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run("full-init-complete", "v1");
    });
}


export function getCmsHomeContent(): CmsHomeRecord {
    const row = db.prepare("SELECT content FROM cms_home_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsHomeContent;
    }

    try {
        return normalizeCmsHomeContent(JSON.parse(String(row.content)) as Partial<CmsHomeContent>);
    } catch {
        return defaultCmsHomeContent;
    }
}

export function saveCmsHomeContent(input: CmsHomeRecord) {
    const normalized = normalizeCmsHomeContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_home_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsHomeContent();
}

export function getCmsCommunityContent(): CmsCommunityRecord {
    const row = db.prepare("SELECT content FROM cms_community_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsCommunityContent;
    }

    try {
        return normalizeCmsCommunityContent(JSON.parse(String(row.content)) as Partial<CmsCommunityContent>);
    } catch {
        return defaultCmsCommunityContent;
    }
}

export function saveCmsCommunityContent(input: CmsCommunityRecord) {
    const normalized = normalizeCmsCommunityContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_community_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsCommunityContent();
}

export function getCmsTourOptionsContent(): CmsTourOptionsRecord {
    const row = db.prepare("SELECT content FROM cms_tour_options_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsTourOptionsContent;
    }

    try {
        return normalizeCmsTourOptionsContent(JSON.parse(String(row.content)) as Partial<CmsTourOptionsContent>);
    } catch {
        return defaultCmsTourOptionsContent;
    }
}

export function saveCmsTourOptionsContent(input: CmsTourOptionsRecord) {
    const normalized = normalizeCmsTourOptionsContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_tour_options_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsTourOptionsContent();
}

export function getCmsTourRegionCardsContent(): CmsTourRegionCardsRecord {
    const row = db.prepare("SELECT content FROM cms_tour_region_cards_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsTourRegionCardsContent;
    }

    try {
        return normalizeCmsTourRegionCardsContent(
            JSON.parse(String(row.content)) as Partial<CmsTourRegionCardsContent>
        );
    } catch {
        return defaultCmsTourRegionCardsContent;
    }
}

export function saveCmsTourRegionCardsContent(input: CmsTourRegionCardsRecord) {
    const normalized = normalizeCmsTourRegionCardsContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_tour_region_cards_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsTourRegionCardsContent();
}

export function getCmsTourCustomizeContent(): CmsTourCustomizeRecord {
    const row = db.prepare("SELECT content FROM cms_tour_customize_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsTourCustomizeContent;
    }

    try {
        return normalizeCmsTourCustomizeContent(
            JSON.parse(String(row.content)) as Partial<CmsTourCustomizeContent>
        );
    } catch {
        return defaultCmsTourCustomizeContent;
    }
}

export function saveCmsTourCustomizeContent(input: CmsTourCustomizeRecord) {
    const normalized = normalizeCmsTourCustomizeContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_tour_customize_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsTourCustomizeContent();
}

export function getCmsTourThemesContent(): CmsTourThemesRecord {
    const row = db.prepare("SELECT content FROM cms_tour_themes_content WHERE id = 1").get();
    if (!row?.content) {
        return defaultCmsTourThemesContent;
    }

    try {
        return normalizeCmsTourThemesContent(
            JSON.parse(String(row.content)) as Partial<CmsTourThemesContent>
        );
    } catch {
        return defaultCmsTourThemesContent;
    }
}

export function saveCmsTourThemesContent(input: CmsTourThemesRecord) {
    const normalized = normalizeCmsTourThemesContent(input);
    const updatedAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO cms_tour_themes_content (id, content, updatedAt)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            updatedAt = excluded.updatedAt
    `).run(JSON.stringify(normalized), updatedAt);

    return getCmsTourThemesContent();
}

export function getAllCmsTours() {
    return db
        .prepare("SELECT * FROM cms_tours ORDER BY id ASC")
        .all()
        .map((row) => deserializeTour(row));
}

export function getCmsTourById(id: number) {
    const row = db.prepare("SELECT * FROM cms_tours WHERE id = ?").get(id);
    return row ? deserializeTour(row) : null;
}

export function saveCmsTour(input: CmsTourRecord) {
    const now = new Date().toISOString();
    const serialized = serializeTour(input);

    db.prepare(`
        INSERT INTO cms_tours (
            id, region, theme, durationType, price, deposit, gradient, heroImage,
            images, detailImages, title, desc, tags, tagColors, duration, highlights, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT createdAt FROM cms_tours WHERE id = ?), ?), ?)
        ON CONFLICT(id) DO UPDATE SET
            region = excluded.region,
            theme = excluded.theme,
            durationType = excluded.durationType,
            price = excluded.price,
            deposit = excluded.deposit,
            gradient = excluded.gradient,
            heroImage = excluded.heroImage,
            images = excluded.images,
            detailImages = excluded.detailImages,
            title = excluded.title,
            desc = excluded.desc,
            tags = excluded.tags,
            tagColors = excluded.tagColors,
            duration = excluded.duration,
            highlights = excluded.highlights,
            updatedAt = excluded.updatedAt
    `).run(
        serialized.id,
        serialized.region,
        serialized.theme,
        serialized.durationType,
        serialized.price,
        serialized.deposit,
        serialized.gradient,
        serialized.heroImage,
        serialized.images,
        serialized.detailImages,
        serialized.title,
        serialized.desc,
        serialized.tags,
        serialized.tagColors,
        serialized.duration,
        serialized.highlights,
        serialized.id,
        now,
        now
    );

    return getCmsTourById(input.id);
}

export function deleteCmsTour(id: number) {
    const existing = getCmsTourById(id);
    if (!existing) return null;

    db.prepare("DELETE FROM cms_tours WHERE id = ?").run(id);
    return existing;
}

export function createCrmInquiry(input: Omit<CrmInquiryRecord, "id" | "status" | "createdAt">) {
    const createdAt = new Date().toISOString();
    const result = db.prepare(`
        INSERT INTO crm_inquiries (name, email, phone, subject, message, locale, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(input.name, input.email, input.phone, input.subject, input.message, input.locale, createdAt);

    return Number(result.lastInsertRowid ?? 0);
}

export function getCrmInquiries() {
    return db.prepare("SELECT * FROM crm_inquiries ORDER BY createdAt DESC").all() as unknown as CrmInquiryRecord[];
}

export function updateCrmInquiryStatus(id: number, status: string) {
    const allowedStatuses = new Set(["new", "checking", "answered", "closed"]);
    const normalizedStatus = allowedStatuses.has(status) ? status : "new";

    db.prepare("UPDATE crm_inquiries SET status = ? WHERE id = ?").run(normalizedStatus, id);

    const row = db.prepare("SELECT * FROM crm_inquiries WHERE id = ? LIMIT 1").get(id);
    return row ? (row as unknown as CrmInquiryRecord) : null;
}

function deserializeCrmPaymentOrder(row: Record<string, unknown>): CrmPaymentOrderRecord {
    return {
        id: Number(row.id),
        orderId: String(row.orderId),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        paymentMethod: String(row.paymentMethod),
        optionKeys: JSON.parse(String(row.optionKeys)) as string[],
        memo: String(row.memo),
        amount: Number(row.amount),
        status: String(row.status),
        paymentKey: row.paymentKey ? String(row.paymentKey) : null,
        bookingNo: row.bookingNo ? String(row.bookingNo) : null,
        createdAt: String(row.createdAt),
        approvedAt: row.approvedAt ? String(row.approvedAt) : null,
        tour: getCmsTourById(Number(row.tourId)),
    };
}

export function getCrmPaymentOrder(orderId: string) {
    const row = db
        .prepare("SELECT * FROM crm_payment_orders WHERE orderId = ? LIMIT 1")
        .get(orderId.trim());

    return row ? deserializeCrmPaymentOrder(row) : null;
}

export function getCrmPaymentOrders() {
    return db
        .prepare("SELECT * FROM crm_payment_orders ORDER BY createdAt DESC")
        .all()
        .map((row) => deserializeCrmPaymentOrder(row));
}

export function getCrmPaymentOrderByBookingNo(bookingNo: string) {
    const row = db
        .prepare("SELECT * FROM crm_payment_orders WHERE bookingNo = ? ORDER BY createdAt DESC LIMIT 1")
        .get(bookingNo.trim());

    return row ? deserializeCrmPaymentOrder(row) : null;
}

export function markCrmPaymentOrderCancelledByBookingNo(bookingNo: string) {
    db.prepare(`
        UPDATE crm_payment_orders
        SET status = 'cancelled'
        WHERE bookingNo = ?
    `).run(bookingNo.trim());

    return getCrmPaymentOrderByBookingNo(bookingNo);
}

export function createCrmPaymentOrder(input: {
    orderId: string;
    tourId: number;
    customTitle?: string;
    customSummary?: string;
    totalAmount?: number;
    customerName: string;
    email: string;
    phone: string;
    departDate: string;
    guests: number;
    locale: string;
    paymentMethod: string;
    optionKeys: string[];
    memo: string;
    amount: number;
}) {
    const createdAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO crm_payment_orders (
            orderId, tourId, customTitle, customSummary, totalAmount, customerName, email, phone, departDate, guests, locale,
            paymentMethod, optionKeys, memo, amount, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?)
    `).run(
        input.orderId.trim(),
        input.tourId,
        input.customTitle?.trim() ?? "",
        input.customSummary?.trim() ?? "",
        Math.max(0, Math.round(Number(input.totalAmount ?? 0))),
        input.customerName.trim(),
        input.email.trim(),
        input.phone.trim(),
        input.departDate.trim(),
        input.guests,
        input.locale.trim(),
        input.paymentMethod.trim(),
        JSON.stringify(input.optionKeys),
        input.memo.trim(),
        input.amount,
        createdAt
    );

    return getCrmPaymentOrder(input.orderId);
}

export function completeCrmPaymentOrder(input: {
    orderId: string;
    paymentKey: string;
    bookingNo: string;
}) {
    const approvedAt = new Date().toISOString();

    db.prepare(`
        UPDATE crm_payment_orders
        SET status = 'paid',
            paymentKey = ?,
            bookingNo = ?,
            approvedAt = ?
        WHERE orderId = ?
    `).run(
        input.paymentKey.trim(),
        input.bookingNo.trim(),
        approvedAt,
        input.orderId.trim()
    );

    return getCrmPaymentOrder(input.orderId);
}

export function finalizeCrmPaymentOrderWithBooking(input: {
    orderId: string;
    paymentKey: string;
    booking: Parameters<typeof createCrmBooking>[0];
}):
    | { ok: true; booking: CrmBookingRecord; alreadyProcessed: boolean }
    | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_NOT_PAYABLE" | "BOOKING_CREATE_FAILED" } {
    db.exec("BEGIN IMMEDIATE");

    try {
        const paymentOrder = getCrmPaymentOrder(input.orderId);

        if (!paymentOrder) {
            db.exec("ROLLBACK");
            return { ok: false, code: "ORDER_NOT_FOUND" };
        }

        if (paymentOrder.status === "paid" && paymentOrder.bookingNo) {
            const existingBooking = findCrmBookingByNo(paymentOrder.bookingNo);
            if (existingBooking) {
                db.exec("COMMIT");
                return { ok: true, booking: existingBooking, alreadyProcessed: true };
            }
        }

        if (paymentOrder.status !== "ready") {
            db.exec("ROLLBACK");
            return { ok: false, code: "ORDER_NOT_PAYABLE" };
        }

        const booking = createCrmBooking(input.booking);
        if (!booking) {
            db.exec("ROLLBACK");
            return { ok: false, code: "BOOKING_CREATE_FAILED" };
        }

        completeCrmPaymentOrder({
            orderId: input.orderId,
            paymentKey: input.paymentKey,
            bookingNo: booking.bookingNo,
        });

        db.exec("COMMIT");
        return { ok: true, booking, alreadyProcessed: false };
    } catch (error) {
        try {
            db.exec("ROLLBACK");
        } catch {
            // Ignore rollback failures so the original error can surface.
        }
        throw error;
    }
}

function findCrmBookingByNo(bookingNo: string) {
    const row = db
        .prepare("SELECT * FROM crm_bookings WHERE bookingNo = ? ORDER BY createdAt DESC LIMIT 1")
        .get(bookingNo.trim());

    if (!row) return null;

    return {
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    } satisfies CrmBookingRecord;
}

function buildCrmBookingNo() {
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");

    while (true) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const bookingNo = `BW-${stamp}-${suffix}`;
        const exists = db
            .prepare("SELECT 1 as found FROM crm_bookings WHERE bookingNo = ? LIMIT 1")
            .get(bookingNo);

        if (!exists) {
            return bookingNo;
        }
    }
}

export function createCrmBooking(input: {
    tourId: number;
    customTitle?: string;
    customSummary?: string;
    totalAmount?: number;
    depositAmount?: number;
    customerName: string;
    email: string;
    phone: string;
    departDate: string;
    guests: number;
    locale: string;
    status?: string;
}) {
    const bookingNo = buildCrmBookingNo();
    const createdAt = new Date().toISOString();
    const status = input.status?.trim() || "confirmed";
    const tour = getCmsTourById(input.tourId);
    const totalAmount = Math.max(
        0,
        Math.round(Number(input.totalAmount && input.totalAmount > 0 ? input.totalAmount : (tour?.price ?? 0) * input.guests))
    );
    const depositAmount = Math.max(
        0,
        Math.round(Number(input.depositAmount && input.depositAmount > 0 ? input.depositAmount : (tour?.deposit ?? 0) * input.guests))
    );

    db.prepare(`
        INSERT INTO crm_bookings (
            bookingNo, tourId, customTitle, customSummary, totalAmount, depositAmount, customerName, email, phone, departDate, guests, locale, status, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        bookingNo,
        input.tourId,
        input.customTitle?.trim() ?? "",
        input.customSummary?.trim() ?? "",
        totalAmount,
        depositAmount,
        input.customerName.trim(),
        input.email.trim(),
        input.phone.trim(),
        input.departDate.trim(),
        input.guests,
        input.locale.trim(),
        status,
        createdAt
    );

    return findCrmBookingByNo(bookingNo);
}

export function getCrmBookings(): CrmBookingRecord[] {
    const rows = db.prepare("SELECT * FROM crm_bookings ORDER BY createdAt DESC").all();

    return rows.map((row) => ({
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    }));
}

export function getCrmBookingsByEmail(email: string): CrmBookingRecord[] {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return [];

    const rows = db
        .prepare("SELECT * FROM crm_bookings WHERE LOWER(email) = ? ORDER BY createdAt DESC")
        .all(normalized);

    return rows.map((row) => ({
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    }));
}

export function updateCrmBookingStatus(id: number, status: string) {
    const allowedStatuses = new Set(["pending", "confirmed", "paid", "completed", "cancelled"]);
    const normalizedStatus = allowedStatuses.has(status) ? status : "pending";

    db.prepare("UPDATE crm_bookings SET status = ? WHERE id = ?").run(normalizedStatus, id);

    const row = db.prepare("SELECT * FROM crm_bookings WHERE id = ? LIMIT 1").get(id);
    if (!row) return null;

    return {
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    } satisfies CrmBookingRecord;
}

export function getCrmBookingById(id: number) {
    const row = db.prepare("SELECT * FROM crm_bookings WHERE id = ? LIMIT 1").get(id);
    if (!row) return null;

    return {
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    } satisfies CrmBookingRecord;
}

export function cancelCrmBookingById(input: {
    id: number;
    cancelReason: string;
    cancelMemo: string;
}) {
    const target = getCrmBookingById(input.id);
    if (!target) return null;

    db.prepare(`
        UPDATE crm_bookings
        SET status = 'cancelled', cancelReason = ?, cancelMemo = ?
        WHERE id = ?
    `).run(input.cancelReason.trim(), input.cancelMemo.trim(), target.id);

    return getCrmBookingById(input.id);
}

export function findCrmBookingByNoForEmail(bookingNo: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return null;

    const row = db
        .prepare(
            "SELECT * FROM crm_bookings WHERE bookingNo = ? AND LOWER(email) = ? ORDER BY createdAt DESC LIMIT 1"
        )
        .get(bookingNo.trim(), normalizedEmail);

    if (!row) return null;

    return {
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    } satisfies CrmBookingRecord;
}

export function findCrmBooking(bookingNo: string, customerName: string) {
    const row = db
        .prepare(
            "SELECT * FROM crm_bookings WHERE bookingNo = ? AND customerName = ? ORDER BY createdAt DESC LIMIT 1"
        )
        .get(bookingNo.trim(), customerName.trim());

    if (!row) return null;

    return {
        id: Number(row.id),
        bookingNo: String(row.bookingNo),
        tourId: Number(row.tourId),
        customTitle: String(row.customTitle ?? ""),
        customSummary: String(row.customSummary ?? ""),
        totalAmount: Number(row.totalAmount ?? 0),
        depositAmount: Number(row.depositAmount ?? 0),
        customerName: String(row.customerName),
        email: String(row.email ?? ""),
        phone: String(row.phone),
        departDate: String(row.departDate),
        guests: Number(row.guests),
        locale: String(row.locale),
        status: String(row.status),
        cancelReason: row.cancelReason ? String(row.cancelReason) : null,
        cancelMemo: row.cancelMemo ? String(row.cancelMemo) : null,
        createdAt: String(row.createdAt),
        tour: getCmsTourById(Number(row.tourId)),
    } satisfies CrmBookingRecord;
}

export function cancelCrmBooking(input: {
    bookingNo: string;
    customerName: string;
    cancelReason: string;
    cancelMemo: string;
}) {
    const target = findCrmBooking(input.bookingNo, input.customerName);
    if (!target) return null;

    db.prepare(`
        UPDATE crm_bookings
        SET status = 'cancelled', cancelReason = ?, cancelMemo = ?
        WHERE id = ?
    `).run(input.cancelReason, input.cancelMemo, target.id);

    return findCrmBooking(input.bookingNo, input.customerName);
}

export function getCrmOverview() {
    const inquiries = getCrmInquiries();
    const bookings = getCrmBookings();

    return {
        inquiryCount: inquiries.length,
        bookingCount: bookings.length,
        cancelledCount: bookings.filter((booking) => booking.status === "cancelled").length,
        latestInquiryAt: inquiries[0]?.createdAt ?? null,
        latestBookingAt: bookings[0]?.createdAt ?? null,
    };
}
