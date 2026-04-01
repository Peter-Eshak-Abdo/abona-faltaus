"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaMusic,
  FaBook,
  FaChurch,
  FaFileAlt,
  FaPenFancy,
  FaPlayCircle,
  FaCog,
  FaInfoCircle,
} from "react-icons/fa";
import LogoHeader from "@/components/LogoHeader";
import UserHeader from "@/components/UserHeader";
import { supabase } from "@/lib/supabase";

const sections = [
  { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
  { name: "حول", href: "/about", icon: <FaInfoCircle /> },
  { name: "الشروط والاحكام", href: "/terms", icon: <FaInfoCircle /> },
  { name: "الإعدادات", href: "/settings", icon: <FaCog /> },
  { name: "السياسة والخصوصية", href: "/privacy", icon: <FaFileAlt /> },
  { name: "الشات بوت", href: "/chat", icon: <FaFileAlt /> },
  // { name: "المقالات", href: "/mkalat", icon: <FaFileAlt /> },
  { name: "العظات", href: "/3zat", icon: <FaChurch /> },
  { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
  { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
  { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
  { name: "القطمارس", href: "/readings", icon: <FaBook /> },
  { name: "الخولاجي", href: "/prayers", icon: <FaBook /> },
];

export default function HomeClient() {
  const [showMenu, setShowMenu] = useState(false);
  const [logoPos, setLogoPos] = useState("center");
  const eagleControls = useAnimation();
  const [lastUpdate, setLastUpdate] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [commitCount, setCommitCount] = useState(0);

  useEffect(() => {
    // أول ما يسجل دخول، بنمسح الـ Hash من الرابط عشان ما يهنقش
    if (window.location.hash) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event: string) => {
        if (event === 'SIGNED_IN') {
          // بيمسح الـ access_token من الرابط بدون ما يعمل ريفريش
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const fetchLastCommit = async () => {
      try {
        const baseApiUrl = 'https://api.github.com/repos/Peter-Eshak-Abdo/abona-faltaus';

        const commitRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=5`);
        const commits = await commitRes.json();

        if (commits && commits.length > 0) {
          const myCommit = commits.find((c: { commit: { author: { name: string | string[]; }; }; }) => !c.commit.author.name.includes('dependabot')) || commits[0];

          const commitObj = myCommit.commit;
          const commitDate = new Date(commitObj.committer.date);

          setLastUpdate(commitDate.toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }));

          setLastMessage(commitObj.message);
        }
        const countRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=1`);
        const linkHeader = countRes.headers.get('link');

        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            setCommitCount(parseInt(match[1], 10));
          }
        } else {
          const allCommits = await countRes.json();
          setCommitCount(allCommits.length);
        }

      } catch (error) {
        console.error("Error fetching commit:", error);
      }
    };

    fetchLastCommit();
  }, []);

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
    <motion.div className="min-h-screen relative overflow-hidden">
      <LogoHeader />
      <UserHeader />
      {/* اللوجو الأساسي */}
      <motion.div
        className="z-20 rounded-full border-blue-300 shadow-xl absolute bg-transparent"
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
              scale: 0.30,
            }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-transparent shadow-none"
          style={{ outline: "none" }}
        >
          <Image
            src="/images/logo.webp"
            alt="Logo"
            width={250}
            height={250}
            className="rounded-full border-blue-300"
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-auto"
              style={{
                width: '50vw',
                maxWidth: '250px',
                height: 'auto',
              }}
            >
              <Image
                src="/images/eagle.webp"
                alt="Eagle"
                width={210}
                height={140}
                sizes="auto"
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
            const x = Math.cos(angle) * 135 - 37;
            const y = Math.sin(angle) * 160 - 40;
            return (
              <motion.div
                key={section.name}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x, y, opacity: 1 }}
                exit={{ x: 0, y: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  delay: index * 0.04,
                }}
                className="absolute left-1/2 top-1/2 mx-auto"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <Link href={section.href}>
                  <div className="hover:bg-purple-500 rounded-full w-5 h-4 flex flex-col items-center justify-center text-center shadow-xl shadow-xl/30 inset-shadow-sm border-white transition-all duration-300 cursor-pointer hover:scale-110 text-[8px] sm:text-[10px]">
                    <div className="text-sm">{section.icon}</div>
                    <div className="leading-tight text-sm font-bold">{section.name}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
      </AnimatePresence>

      <footer className="absolute text-start mt-1 text-xs md:text-sm opacity-80 bottom-1 ltr:left-1 rtl:right-1">
        <div className="flex flex-col gap-0.5">
          <p>
            <strong>آخر تحديث:</strong> {lastUpdate || "..."}
          </p>
          {lastMessage && (
            <p className="italic opacity-70 border-r-2 border-primary pr-1">
              "{lastMessage}"
            </p>
          )}
          <p className="text-[10px]">
            إجمالي التحديثات: <span className="font-bold text-primary">{commitCount}</span>
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
