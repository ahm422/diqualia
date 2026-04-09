"use client";

import { useEffect } from "react";

export function ReferenceInteractions() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;

    const cur = document.getElementById("cur");
    const curR = document.getElementById("cur-r");

    if (reduceMotion || coarsePointer) {
      if (cur) (cur as HTMLElement).style.display = "none";
      if (curR) (curR as HTMLElement).style.display = "none";
    }

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
    }

    let raf = 0;
    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;

      if (cur) {
        (cur as HTMLElement).style.left = `${mx}px`;
        (cur as HTMLElement).style.top = `${my}px`;
      }
      if (curR) {
        (curR as HTMLElement).style.left = `${rx}px`;
        (curR as HTMLElement).style.top = `${ry}px`;
      }

      raf = window.requestAnimationFrame(loop);
    }

    function onScroll() {
      const nav = document.getElementById("nav");
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 60);
    }

    if (!reduceMotion && !coarsePointer) {
      document.addEventListener("mousemove", onMove);
      raf = window.requestAnimationFrame(loop);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".diq-navLinks a[href^='#']"),
    );
    const ids = ["about", "services", "process", "industries", "contact"];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => Boolean(x));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          for (const l of links) l.classList.remove("active");
          const active = links.find((l) => l.getAttribute("href") === `#${id}`);
          if (active) active.classList.add("active");
        }
      },
      { threshold: 0.35 },
    );
    targets.forEach((t) => activeObserver.observe(t));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll<HTMLElement>(".diq-reveal").forEach((el) => revealObserver.observe(el));

    function onAnchorClick(e: MouseEvent) {
      const a = e.currentTarget as HTMLAnchorElement;
      const href = a.getAttribute("href");
      if (!href?.startsWith("#")) return;
      const t = document.querySelector<HTMLElement>(href);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^='#']"));
    anchors.forEach((a) => a.addEventListener("click", onAnchorClick));

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      activeObserver.disconnect();
      revealObserver.disconnect();
      anchors.forEach((a) => a.removeEventListener("click", onAnchorClick));
    };
  }, []);

  return null;
}

