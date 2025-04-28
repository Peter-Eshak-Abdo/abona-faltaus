"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { name: "الصفحة الرئيسية", href: "/" },
  { name: "الحان", href: "/al7an" },
  { name: "ترانيم", href: "/tranim" },
  { name: "عظات", href: "/3zat" },
  { name: "الكتاب المقدس", href: "/bible" },
  { name: "مقالات", href: "/mkalat" },
  { name: "امتحانات", href: "/exam" },
];

function Header() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.classList.remove("fade-in");
      void main.offsetWidth; // trigger reflow
      main.classList.add("fade-in");
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opacity = Math.max(1 - scrollY / 200, 0.4); // يبدأ بـ 1 ويقل تدريجياً لحد 0.4
  return (
    <>
      <nav
        className="navbar navbar-expand-lg fixed-top shadow-sm"
        style={{
          backgroundColor: `rgba(13, 110, 253, ${opacity})`, // Bootstrap primary color مع شفافية
          transition: "background-color 0.3s ease",
        }}
      >
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <Image
              src="/images/logo.jpg"
              alt="لوجو أبونا فلتاؤس"
              width={50}
              height={40}
              className="rounded me-2"
              style={{
                transition: "transform 0.5s ease-in-out",
                transform: `rotate(${scrollY / 5}deg)`, // حركة خفيفة للوجو
              }}
            />
            <span className="fw-bold text-white">أبونا فلتاؤس</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-controls="navbarNav"
            aria-expanded={!isCollapsed ? "true" : "false"}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`collapse visible navbar-collapse ${
              !isCollapsed ? "show" : ""
            }`}
            style={{
              visibility: "visible !important",
            }}
            id="navbarNav"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {links.map((link) => (
                <li className="nav-item" key={link.name}>
                  <Link
                    className="nav-link text-white fw-semibold"
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer تحت الـNavbar عشان ميغطيش المحتوى */}
      <div style={{ height: "80px" }} />
    </>
  );
}
export default Header;
