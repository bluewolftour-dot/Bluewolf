"use client";

import { useEffect, useMemo, useState } from "react";
import { type Locale } from "@/lib/bluewolf-data";
import {
    defaultCmsHomeContent,
    normalizeCmsHomeContent,
    type CmsHomeContent,
} from "@/lib/cms-home";

function serializeHomeContent(value: CmsHomeContent) {
    return JSON.stringify(value);
}

export function useHomeCmsEditorState() {
    const [homeContent, setHomeContent] = useState<CmsHomeContent>(defaultCmsHomeContent);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [savedSnapshot, setSavedSnapshot] = useState(() =>
        serializeHomeContent(defaultCmsHomeContent)
    );

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/home", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("CMS_HOME_FETCH_FAILED");
                }

                const data = (await response.json()) as { home: CmsHomeContent };
                if (!active) return;

                const normalized = normalizeCmsHomeContent(data.home);
                setHomeContent(normalized);
                setSavedSnapshot(serializeHomeContent(normalized));
                setError(null);
            } catch {
                if (!active) return;
                setHomeContent(defaultCmsHomeContent);
                setSavedSnapshot(serializeHomeContent(defaultCmsHomeContent));
                setError("홈 CMS 데이터를 불러오지 못했습니다.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const onSlideTextChange = (
        locale: Locale,
        index: number,
        key: "eyebrow" | "title" | "desc",
        value: string
    ) => {
        setHomeContent((current) => ({
            ...current,
            heroSlides: {
                ...current.heroSlides,
                [locale]: current.heroSlides[locale].map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, [key]: value } : slide
                ),
            },
        }));
        setSaved(false);
    };

    const onSlideImageChange = (index: number, value: string) => {
        setHomeContent((current) => ({
            ...current,
            heroSlides: {
                ko: current.heroSlides.ko.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, image: value } : slide
                ),
                ja: current.heroSlides.ja.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, image: value } : slide
                ),
                en: current.heroSlides.en.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, image: value } : slide
                ),
            },
        }));
        setSaved(false);
    };

    const onSlideLinkChange = (index: number, value: string) => {
        setHomeContent((current) => ({
            ...current,
            heroSlides: {
                ko: current.heroSlides.ko.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, href: value } : slide
                ),
                ja: current.heroSlides.ja.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, href: value } : slide
                ),
                en: current.heroSlides.en.map((slide, slideIndex) =>
                    slideIndex === index ? { ...slide, href: value } : slide
                ),
            },
        }));
        setSaved(false);
    };

    const onPromoImageChange = (index: number, value: string) => {
        setHomeContent((current) => ({
            ...current,
            promoBanners: current.promoBanners.map((banner, bannerIndex) =>
                bannerIndex === index ? { ...banner, image: value } : banner
            ),
        }));
        setSaved(false);
    };

    const onPromoLinkChange = (index: number, value: string) => {
        setHomeContent((current) => ({
            ...current,
            promoBanners: current.promoBanners.map((banner, bannerIndex) =>
                bannerIndex === index ? { ...banner, href: value } : banner
            ),
        }));
        setSaved(false);
    };

    const onPromoAltChange = (index: number, locale: Locale, value: string) => {
        setHomeContent((current) => ({
            ...current,
            promoBanners: current.promoBanners.map((banner, bannerIndex) =>
                bannerIndex === index
                    ? { ...banner, alt: { ...banner.alt, [locale]: value } }
                    : banner
            ),
        }));
        setSaved(false);
    };

    const onSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const response = await fetch("/api/cms/home", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(homeContent),
            });

            if (!response.ok) {
                throw new Error("CMS_HOME_SAVE_FAILED");
            }

            const data = (await response.json()) as { home: CmsHomeContent };
            const normalized = normalizeCmsHomeContent(data.home);
            setHomeContent(normalized);
            setSavedSnapshot(serializeHomeContent(normalized));
            setSaved(true);
            setError(null);
        } catch {
            setError("홈 CMS 저장 중 문제가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const onUpload = async (
        slot: string,
        file: File,
        onApply: (path: string) => void
    ) => {
        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);
        setUploadingSlot(slot);

        try {
            const response = await fetch("/api/cms/home/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("CMS_HOME_UPLOAD_FAILED");
            }

            const data = (await response.json()) as { path: string };
            onApply(data.path);
            setSaved(false);
            setError(null);
        } catch {
            setError("이미지 업로드에 실패했습니다. JPG, PNG 또는 WEBP 파일만 업로드할 수 있습니다.");
        } finally {
            setUploadingSlot(null);
        }
    };

    const dirty = useMemo(
        () => !loading && serializeHomeContent(homeContent) !== savedSnapshot,
        [homeContent, loading, savedSnapshot]
    );

    return {
        homeContent,
        loading,
        saving,
        saved,
        dirty,
        error,
        uploadingSlot,
        onSlideTextChange,
        onSlideImageChange,
        onSlideLinkChange,
        onPromoImageChange,
        onPromoLinkChange,
        onPromoAltChange,
        onSave,
        onUpload,
    };
}
