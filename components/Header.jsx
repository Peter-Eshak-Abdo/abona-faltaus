"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { name: "الصفحة الرئيسية", href: "/" },
  { name: "الحان", href: "/al7an" },
  { name: "ترانيم", href: "/tranim" },
  { name: "عظات", href: "/3zat" },
  { name: "الكتاب المقدس", href: "/bible" },
  { name: "مقالات", href: "/mkalat" },
  { name: "امتحانات", href: "/exam" },
  { name: "الإعدادات", href: "/settings" },
  { name: "حول", href: "/about" },
];

function Header() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.classList.remove("fade-in");
      void main.offsetWidth;
      main.classList.add("fade-in");
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opacity = Math.max(1 - scrollY / 200, 0.4);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 shadow-md transition-colors duration-300"
        style={{
          backgroundColor: `rgba(59, 130, 246, ${opacity})`, // blue-500
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link className="flex items-center gap-2" href="/">
            <Image
              src="/images/logo.jpg"
              alt="لوجو أبونا فلتاؤس"
              width={50}
              height={40}
              className="rounded"
              style={{
                transition: "transform 0.5s ease-in-out",
                transform: `rotate(${scrollY / 5}deg)`,
              }}
            />
            <span className="font-bold text-white">أبونا فلتاؤس</span>
          </Link>
          <button
            className="md:hidden text-white p-2"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-controls="navbarNav"
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
          >
            {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </button>

          <div
            className={`md:flex ${isCollapsed ? 'hidden' : 'flex'} flex-col md:flex-row gap-4 md:gap-6`}
            id="navbarNav"
          >
            <ul className="flex flex-col md:flex-row gap-4 md:gap-6">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`font-semibold text-white hover:text-yellow-400 transition-colors ${
                        isActive ? "text-yellow-400" : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer عشان يبعد الهيدر عن باقي الصفحة */}
      <div style={{ height: "80px" }} />
    </>
  );
}

export default Header;
