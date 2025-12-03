"use client";
import { useEffect } from "react";

export default function LazyLoadOnInteraction({ src, id }: { src: string; id?: string }) {
  useEffect(() => {
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      const s = document.createElement("script");
      if (id) s.id = id;
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    };
    window.addEventListener("click", load, { once: true });
    window.addEventListener("scroll", load, { once: true });
    window.addEventListener("mousemove", load, { once: true });
    window.addEventListener("touchstart", load, { once: true });
    // optional: load after 3s idle
    const idle = setTimeout(load, 3000);
    return () => {
      clearTimeout(idle);
      window.removeEventListener("click", load);
      window.removeEventListener("scroll", load);
      window.removeEventListener("mousemove", load);
      window.removeEventListener("touchstart", load);
    };
  }, [src, id]);

  return null;
}
