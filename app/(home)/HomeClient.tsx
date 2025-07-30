"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaMusic,
  FaBook,
  FaChurch,
  FaFileAlt,
  FaPenFancy,
  FaPlayCircle,
} from "react-icons/fa";
import LogoHeader from "@/components/LogoHeader";
import UserHeader from "@/components/UserHeader";

const sections = [
  { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
  { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
  { name: "العظات", href: "/3zat", icon: <FaChurch /> },
  { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
  { name: "المقالات", href: "/mkalat", icon: <FaFileAlt /> },
  { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
];

export default function HomeClient() {
  // const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [logoPos, setLogoPos] = useState("center");
  const eagleControls = useAnimation();

  useEffect(() => {
    if (showMenu) {
      eagleControls.start({
        rotateX: [0, 10, -10, 0],
        rotateY: [0, 10, -10, 0],
        transition: { repeat: Infinity, duration: 6, ease: "easeInOut" },
      });
    }
  }, [showMenu, eagleControls]);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
    setLogoPos((prev) => (prev === "center" ? "bottom" : "center"));
  };

  return (
    <motion.div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-blue-100">
      <LogoHeader />
      <UserHeader />

      {/* اللوجو الأساسي */}
      <motion.div
        className="z-20 rounded-full border-blue-300 p-4 shadow-xl absolute bg-transparent"
        animate={
          logoPos === "center"
            ? {
              top: "50%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
              scale: 1,
            }
            : {
              top: "90%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
              scale: 0.10,
            }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-transparent p-0 border-0 shadow-none"
          style={{ outline: "none" }}
        >
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={200}
            height={200}
            className="rounded-full border-4 border-blue-300"
            priority
          />
        </motion.button>
      </motion.div>

      {/* النسر في النص بحجم متجاوب وحركة تلقائية */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="position-absolute top-50 start-50 translate-middle"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-auto"
              style={{
                width: '50vw',
                maxWidth: '300px',
                height: 'auto',
              }}
            >
              <Image
                src="/images/eagle.png"
                alt="Eagle"
                width={300}
                height={300}
                style={{ width: '100%', height: 'auto' }}
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* العناصر الدائرية حول النسر */}
      <AnimatePresence>
        {showMenu &&
          sections.map((section, index) => {
            const angle = (index / sections.length) * 2 * Math.PI;
            const x = Math.cos(angle) * 150 - 35;
            const y = Math.sin(angle) * 150 - 10;
            return (
              <motion.div
                key={section.name}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x, y, opacity: 1 }}
                exit={{ x: 0, y: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="absolute left-1/2 top-1/2"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <Link href={section.href}>
                  <div className="bg-purple-700 hover:bg-purple-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center text-center shadow-xl border border-white transition-all duration-300 cursor-pointer hover:scale-110 text-[10px] sm:text-[12px]">
                    <div className="text-base fs-5">{section.icon}</div>
                    <div className="leading-tight mt-1 fs-5 ">{section.name}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
      </AnimatePresence>
      {/* <button
        onClick={() => router.push("/chat")}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all"
        aria-label="افتح الشات"
        title="افتح الشات"
        type="button"
      >
        <svg width="32" height="32" fill="currentColor"><circle cx="16" cy="16" r="16" /></svg>
      </button> */}
    </motion.div>

  );
}
