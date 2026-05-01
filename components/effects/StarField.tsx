"use client";

import { useEffect, useRef } from "react";

export function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        type Star = {
            x: number;
            y: number;
            r: number;
            phase: number;
            twinkleSpeed: number;
            twinkleAmp: number;
            cross: boolean;
        };
        const stars: Star[] = [];

        const createStar = (): Star => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.7 + 0.2,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() < 0.3 ? Math.random() * 3 + 2 : Math.random() * 0.6 + 0.15,
            twinkleAmp: Math.random() * 0.55 + 0.3,
            cross: Math.random() > 0.74,
        });

        const adjustStarCount = () => {
            const density = 0.00042;
            const target = Math.max(180, Math.round(canvas.width * canvas.height * density));
            while (stars.length < target) stars.push(createStar());
            if (stars.length > target) stars.length = target;
        };

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            adjustStarCount();
        };
        resize();

        type Meteor = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            speed: number;
            tailLen: number;
            life: number;
        };
        let meteors: Meteor[] = [];
        let nextMeteor = 2 + Math.random() * 4;

        const spawnMeteor = () => {
            const angle = Math.PI / 9 + Math.random() * (Math.PI / 5.5);
            const speed = 10 + Math.random() * 8;
            meteors.push({
                x: Math.random() * canvas.width * 1.2 - canvas.width * 0.1,
                y: -10 + Math.random() * canvas.height * 0.35,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                speed,
                tailLen: 90 + Math.random() * 100,
                life: 1,
            });
        };

        let frameId = 0;
        let t = 0;
        const omega = 0.00012;
        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            t += 0.016;
            const cx = w * 0.5;
            const cy = h * 2.2;

            stars.forEach((star) => {
                const dx = star.x - cx;
                const dy = star.y - cy;
                star.x += -omega * dy;
                star.y += omega * dx;

                if (star.x < 0) star.x += w;
                else if (star.x > w) star.x -= w;
                if (star.y < 0) star.y += h;
                else if (star.y > h) star.y -= h;

                const x = star.x;
                const y = star.y;
                const twinkle = star.twinkleAmp * Math.sin(t * star.twinkleSpeed + star.phase);
                const alpha = Math.max(0.04, Math.min(1, 0.42 + twinkle));
                const r = star.r * (0.8 + 0.2 * Math.sin(t * star.twinkleSpeed * 1.5 + star.phase + 0.8));
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
                grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
                grad.addColorStop(0.5, `rgba(210,230,255,${alpha * 0.6})`);
                grad.addColorStop(1, "rgba(150,190,255,0)");
                ctx.beginPath();
                ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                if (star.cross && alpha > 0.35) {
                    const len = r * 5.5;
                    const lineAlpha = alpha * 0.28;
                    ctx.strokeStyle = `rgba(180,215,255,${lineAlpha})`;
                    ctx.lineWidth = r * 0.45;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(x - len, y);
                    ctx.lineTo(x + len, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y - len);
                    ctx.lineTo(x, y + len);
                    ctx.stroke();
                }
            });

            if (t >= nextMeteor) {
                spawnMeteor();
                nextMeteor = t + 3 + Math.random() * 6;
            }

            meteors = meteors.filter((meteor) => meteor.life > 0);
            meteors.forEach((meteor) => {
                meteor.x += meteor.vx;
                meteor.y += meteor.vy;
                meteor.life -= 0.022;
                const eased = meteor.life * meteor.life;
                const steps = meteor.tailLen / meteor.speed;
                const tx = meteor.x - meteor.vx * steps;
                const ty = meteor.y - meteor.vy * steps;
                const tg = ctx.createLinearGradient(tx, ty, meteor.x, meteor.y);
                tg.addColorStop(0, "rgba(180,220,255,0)");
                tg.addColorStop(0.6, `rgba(220,235,255,${eased * 0.45})`);
                tg.addColorStop(1, `rgba(255,255,255,${eased})`);
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(meteor.x, meteor.y);
                ctx.strokeStyle = tg;
                ctx.lineWidth = 1.8;
                ctx.lineCap = "round";
                ctx.stroke();

                const hg = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 4);
                hg.addColorStop(0, `rgba(255,255,255,${eased})`);
                hg.addColorStop(0.4, `rgba(200,230,255,${eased * 0.6})`);
                hg.addColorStop(1, "rgba(150,200,255,0)");
                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = hg;
                ctx.fill();
            });

            frameId = requestAnimationFrame(draw);
        };
        draw();

        const resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
