import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import {
    deletePublicCmsImageUpload,
    isSupabaseUploadStorageEnabled,
    listPublicCmsImageUploads,
} from "@/lib/upload-storage";
import {
    getAllCmsTours,
    getCmsCommunityContent,
    getCmsHomeContent,
    getCmsTourCustomizeContent,
    getCmsTourOptionsContent,
    getCmsTourRegionCardsContent,
} from "@/lib/cms-crm-db";

export const runtime = "nodejs";

async function getFilesRecursively(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                return getFilesRecursively(res);
            }
            return res;
        })
    );
    return Array.prototype.concat(...files);
}

export async function DELETE(request: Request) {
    const adminError = await requireAdminResponse();
    if (adminError) return adminError;

    const body = (await request.json().catch(() => null)) as { path?: string; force?: boolean } | null;
    const imagePath = body?.path?.trim();
    if (!imagePath) {
        return NextResponse.json({ error: "MISSING_IMAGE_PATH" }, { status: 400 });
    }

    const usages = await getDisplayImageUsages(imagePath);
    if (usages.length > 0 && !body?.force) {
        return NextResponse.json({ error: "IMAGE_IN_USE", usages }, { status: 409 });
    }

    const deleted = await deletePublicCmsImageUpload(imagePath);
    if (!deleted.ok) {
        return NextResponse.json({ error: deleted.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, usages });
}

type ImageUsage = {
    area: string;
    label: string;
};

function collectExactMatches(value: unknown, target: string): number {
    if (typeof value === "string") return value === target ? 1 : 0;
    if (Array.isArray(value)) {
        return value.reduce((sum, item) => sum + collectExactMatches(item, target), 0);
    }
    if (value && typeof value === "object") {
        return Object.values(value).reduce((sum, item) => sum + collectExactMatches(item, target), 0);
    }
    return 0;
}

function pushUsage(usages: ImageUsage[], area: string, label: string, value: unknown, target: string) {
    if (collectExactMatches(value, target) > 0) {
        usages.push({ area, label });
    }
}

export async function getImageUsages(target: string): Promise<ImageUsage[]> {
    const [home, tours, community, options, regionCards, customize] = await Promise.all([
        getCmsHomeContent(),
        getAllCmsTours(),
        getCmsCommunityContent(),
        getCmsTourOptionsContent(),
        getCmsTourRegionCardsContent(),
        getCmsTourCustomizeContent(),
    ]);

    const usages: ImageUsage[] = [];
    pushUsage(usages, "홈", "히어로/프로모션 이미지", home, target);
    pushUsage(usages, "커뮤니티", "게시글 사진", community, target);
    pushUsage(usages, "투어", "추가옵션 이미지", options, target);
    pushUsage(usages, "투어", "지역 선택 카드 이미지", regionCards, target);
    pushUsage(usages, "투어", "커스터마이즈 이미지", customize, target);

    tours.forEach((tour) => {
        pushUsage(usages, "투어 상품", tour.title.ko || `상품 ${tour.id}`, tour, target);
    });

    return usages;
}

async function getDisplayImageUsages(target: string): Promise<ImageUsage[]> {
    const [home, tours, community, options, regionCards, customize] = await Promise.all([
        getCmsHomeContent(),
        getAllCmsTours(),
        getCmsCommunityContent(),
        getCmsTourOptionsContent(),
        getCmsTourRegionCardsContent(),
        getCmsTourCustomizeContent(),
    ]);

    const usages: ImageUsage[] = [];
    pushUsage(usages, "Home", "Hero or promo image", home, target);
    pushUsage(usages, "Community", "Post photo", community, target);
    pushUsage(usages, "Tours", "Option image", options, target);
    pushUsage(usages, "Tours", "Region card image", regionCards, target);
    pushUsage(usages, "Tours", "Customize image", customize, target);

    tours.forEach((tour) => {
        pushUsage(usages, "Tour item", tour.title.ko || `Tour ${tour.id}`, tour, target);
    });

    return usages;
}

export async function GET() {
    const adminError = await requireAdminResponse();
    if (adminError) return adminError;

    if (isSupabaseUploadStorageEnabled()) {
        try {
            const images = await listPublicCmsImageUploads();
            const imageRecords = await Promise.all(
                images.map(async (image) => ({ path: image, usages: await getDisplayImageUsages(image) }))
            );
            return NextResponse.json({ images, imageRecords });
        } catch {
            return NextResponse.json({ images: [] });
        }
    }

    const baseDir = path.join(process.cwd(), "public");
    const cmsUploadDir = path.join(baseDir, "uploads", "cms");

    try {
        const absoluteFiles = await getFilesRecursively(cmsUploadDir);
        // 절대 경로를 public 기준의 웹 경로로 변환
        const files = absoluteFiles
            .map((file) => {
                const relativePath = path.relative(baseDir, file);
                return `/${relativePath.replace(/\\/g, "/")}`;
            })
            .filter((file) => 
                file.endsWith(".jpg") || 
                file.endsWith(".jpeg") || 
                file.endsWith(".png") || 
                file.endsWith(".webp")
            );

        const imageRecords = await Promise.all(
            files.map(async (image) => ({ path: image, usages: await getDisplayImageUsages(image) }))
        );
        return NextResponse.json({ images: files, imageRecords });
    } catch {
        return NextResponse.json({ images: [] });
    }
}
