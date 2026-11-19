"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Cuộn mượt (Lenis), hiệu ứng xuất hiện khi cuộn và parallax nhẹ cho ảnh. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.4 });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Mỗi lần đổi trang: về đầu trang, gắn lại reveal và parallax.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    // Hiệu ứng bám theo vị trí cuộn: mỗi phần tử có tiến độ --p từ 0 (vừa chạm đáy màn hình)
    // tới 1 (đã đi lên gần nửa màn hình). Cuộn tới đâu hiện tới đó, cuộn ngược thì chạy lùi.
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const update = () => {
      ticking = false;
      if (reduce) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const delay = parseFloat(el.style.getPropertyValue("--d")) || 0; // giây → lùi điểm bắt đầu
        const start = vh * (1 - delay * 0.4);
        const span = vh * (el.dataset.reveal === "img" ? 0.6 : 0.38);
        const raw = (start - r.top) / span;
        const p = raw <= 0 ? 0 : raw >= 1 ? 1 : ease(raw);
        const prev = el.style.getPropertyValue("--p");
        const next = p.toFixed(3);
        if (prev !== next) el.style.setProperty("--p", next);
      });
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const speed = Number(el.dataset.parallax) || 0.12;
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.setProperty("--py", `${offset.toFixed(1)}px`);
      });
    };
    let fallback = 0;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
        // Dự phòng khi trình duyệt tạm dừng requestAnimationFrame (tab bị che, chế độ tiết kiệm pin)
        clearTimeout(fallback);
        fallback = window.setTimeout(() => ticking && update(), 120);
      }
    };
    // Nội dung do client dựng sau (form đặt phòng) cũng được cập nhật
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { childList: true, subtree: true });
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(fallback);
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
