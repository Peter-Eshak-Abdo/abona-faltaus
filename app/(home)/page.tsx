"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaMusic, FaBook, FaChurch, FaFileAlt, FaClipboardList, FaPenFancy, FaPlayCircle } from "react-icons/fa";
// import LoadingProvider from "@/app/loading-provider";
const sections = [
  { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
  { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
  { name: "العظات", href: "/3zat", icon: <FaChurch /> },
  { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
  { name: "المقالات", href: "/mkalat", icon: <FaFileAlt /> },
  { name: "الفقرات", href: "/fqrat", icon: <FaClipboardList /> },
  { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
];

export default function Home() {
  const [loadingSplach, setLoadingSplach] = useState(true);
  // const [autoRotate, setAutoRotate] = useState(true);
  // const [rotation, setRotation] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const radius = 150;

  // useEffect(() => {
  //   if (!autoRotate) return;

  //   const interval = setInterval(() => {
  //     setRotation((prev) => prev + 0.5);
  //   }, 20); // سرعة الدوران

  //   return () => clearInterval(interval);
  // }, [autoRotate]);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingSplach(false), 2500); // 2 ثواني
    return () => clearTimeout(timer);
  }, []);

  if (loadingSplach) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-white">
        <Image src="/images/logo.jpg" width={150} height={150} alt="Logo" />
        <h2 className="ms-3 text-primary">جاري التحميل...</h2>
      </div>
    );
  }

  return (
    <>
      {/* <LoadingProvider> */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-4 flex items-center gap-3 shadow-lg border border-white/20 w-[300px] justify-center z-30">
            <Image
              src="/images/logo.jpg"
              alt="logo"
              width={80}
              height={80}
            />
            <span className="text-black text-lg font-semibold fw-bolder">ابونا فلتاؤس السرياني</span>
          </div>
          <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">

            <AnimatePresence>
              {sections.map((section, index) => {
                const angle = (index / sections.length) * 2 * Math.PI;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return showMenu ? (
                  <motion.div
                    key={section.name}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x, y, opacity: 1 }}
                    exit={{ x: 0, y: 0, opacity: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="absolute"
                    style={{ top: "48%", left: "41%", transform: "translate(-50%, -50%)" }}
                  >
                    <Link href={section.href}>
                      <motion.div className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center text-center shadow-lg border border-gray-600 transition-all duration-300 cursor-pointer">
                        <div className="text-xl">{section.icon}</div>
                        <div className="text-xs mt-1">{section.name}</div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ) : null;
              })}
            </AnimatePresence>

            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-600 to-purple-800 text-white text-2xl font-bold flex items-center justify-center shadow-lg border-4 border-purple-900 z-10"
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 1 }}
              animate={{ rotate: showMenu ? 90 : 0, transition: { duration: 0.5 } }}
            >
              <Image
                src="/images/logo.jpg" // غيّر حسب مكان صورتك
                alt="لوجو البرنامج"
                width={175}
                height={175}
                className="rounded-full"
              />
            </motion.button>
          </div>
        </motion.div>
      {/* </LoadingProvider> */}
    </>
  );
}
