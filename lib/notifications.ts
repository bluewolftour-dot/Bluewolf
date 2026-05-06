import { randomUUID } from "node:crypto";
import { readJsonListStore, writeJsonListStore } from "@/lib/json-store";
import {
    isSupabaseDatabaseEnabled,
    supabaseInsertOne,
    supabasePatch,
    supabaseRestRequest,
} from "@/lib/supabase-server";

export type NotificationType = "booking_confirmed" | "booking_cancelled" | "comment_reply" | "system";

export type Notification = {
    id: string;
    userId: string;
    type: NotificationType;
    title: {
        ko: string;
        ja: string;
        en: string;
    };
    content: {
        ko: string;
        ja: string;
        en: string;
    };
    link?: string;
    isRead: boolean;
    createdAt: string;
};

const notificationsPath = "notifications.json";

type SupabaseNotificationRow = {
    id: string;
    user_id: string;
    type: NotificationType;
    title: Notification["title"];
    content: Notification["content"];
    link: string | null;
    is_read: boolean;
    created_at: string;
};

function toNotification(row: SupabaseNotificationRow): Notification {
    return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        link: row.link ?? undefined,
        isRead: row.is_read,
        createdAt: row.created_at,
    };
}

async function readNotifications(): Promise<Notification[]> {
    return readJsonListStore<Notification>(notificationsPath);
}

async function writeNotifications(notifications: Notification[]) {
    await writeJsonListStore(notificationsPath, notifications);
}

export async function createNotification(input: {
    userId: string;
    type: NotificationType;
    title: Notification["title"];
    content: Notification["content"];
    link?: string;
}) {
    if (isSupabaseDatabaseEnabled()) {
        const row = await supabaseInsertOne<SupabaseNotificationRow>("notifications", {
            user_id: input.userId,
            type: input.type,
            title: input.title,
            content: input.content,
            link: input.link ?? null,
            is_read: false,
        });

        if (!row) {
            throw new Error("Failed to create Supabase notification.");
        }

        return toNotification(row);
    }

    const notifications = await readNotifications();
    const newNotification: Notification = {
        id: randomUUID(),
        ...input,
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    notifications.unshift(newNotification);
    await writeNotifications(notifications.slice(0, 500));
    return newNotification;
}

export async function getUserNotifications(userId: string) {
    if (isSupabaseDatabaseEnabled()) {
        const rows = await supabaseRestRequest<SupabaseNotificationRow[]>("notifications", {
            query: {
                user_id: `eq.${userId}`,
                select: "*",
                order: "created_at.desc",
            },
        });
        return rows.map(toNotification);
    }

    const notifications = await readNotifications();
    return notifications.filter((notification) => notification.userId === userId);
}

export async function markAsRead(notificationId: string, userId: string) {
    if (isSupabaseDatabaseEnabled()) {
        const rows = await supabasePatch<SupabaseNotificationRow>(
            "notifications",
            {
                id: `eq.${notificationId}`,
                user_id: `eq.${userId}`,
            },
            { is_read: true }
        );
        return rows.length > 0;
    }

    const notifications = await readNotifications();
    const target = notifications.find(
        (notification) => notification.id === notificationId && notification.userId === userId
    );

    if (!target) return false;

    target.isRead = true;
    await writeNotifications(notifications);
    return true;
}

export async function markAllAsRead(userId: string) {
    if (isSupabaseDatabaseEnabled()) {
        const rows = await supabasePatch<SupabaseNotificationRow>(
            "notifications",
            {
                user_id: `eq.${userId}`,
                is_read: "eq.false",
            },
            { is_read: true }
        );
        return rows.length > 0;
    }

    const notifications = await readNotifications();
    let changed = false;

    notifications.forEach((notification) => {
        if (notification.userId === userId && !notification.isRead) {
            notification.isRead = true;
            changed = true;
        }
    });

    if (changed) {
        await writeNotifications(notifications);
    }

    return changed;
}
