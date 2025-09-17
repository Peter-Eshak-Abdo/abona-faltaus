"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

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
      <header
        className="fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300"
        style={{
          backgroundColor: `rgba(13, 110, 253, ${opacity})`,
        }}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link className="flex items-center space-x-2 rtl:space-x-reverse" href="/">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-semibold transition-colors ${
                    isActive ? "text-yellow-400" : "text-white hover:text-yellow-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-4">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-semibold transition-colors ${
                        isActive ? "text-yellow-400" : "text-foreground hover:text-yellow-600"
                      }`}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Spacer to offset content from fixed header */}
      <div className="h-20" />
    </>
  );
}

export default Header;
