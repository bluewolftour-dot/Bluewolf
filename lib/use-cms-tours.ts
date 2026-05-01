"use client";

import { useEffect, useMemo, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import { tours as defaultTours, type Tour } from "@/lib/bluewolf-data";
import { normalizeCmsTourImages } from "@/lib/cms-image";

export function useCmsTours() {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialTours = Array.isArray(cmsBootstrap?.tours);
    const [tourItems, setTourItems] = useState<Tour[]>(() =>
        hasInitialTours && cmsBootstrap?.tours
            ? cmsBootstrap.tours.map(normalizeCmsTourImages)
            : defaultTours.map(normalizeCmsTourImages)
    );
    const [loaded, setLoaded] = useState(hasInitialTours);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tours", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { tours: Tour[] };
                if (active && data.tours.length > 0) {
                    setTourItems(data.tours.map(normalizeCmsTourImages));
                }
            } catch {
                // Keep static data as a local fallback if the CMS API is unavailable.
            } finally {
                if (active) {
                    setLoaded(true);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return {
        tourItems,
        loaded,
    };
}

export function useCmsTour(tourId: number) {
    const { tourItems, loaded } = useCmsTours();

    const tour = useMemo(
        () => tourItems.find((tour) => tour.id === tourId) ?? null,
        [tourId, tourItems]
    );

    return {
        tour,
        loaded,
    };
}
