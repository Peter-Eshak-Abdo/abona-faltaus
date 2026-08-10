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
  FaGoogle,
} from "react-icons/fa";
import LogoHeader from "../LogoHeader";
import UserHeader from "../UserHeader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Background from "./Background";
import Widgets from "./Widgets";

const sections = [
  { name: "الامتحانات", href: "/exam/quiz/dashboard", icon: <FaPenFancy />, requiresAuth: true },
  // { name: "الامتحانات", href: "/exam", icon: <FaPenFancy />, requiresAuth: true },
  { name: "حول", href: "/about", icon: <FaInfoCircle /> },
  { name: "الشروط والاحكام", href: "/terms", icon: <FaInfoCircle /> },
  { name: "الإعدادات", href: "/settings", icon: <FaCog /> },
  { name: "السياسة والخصوصية", href: "/privacy", icon: <FaFileAlt /> },
  { name: "الشات بوت", href: "/chat", icon: <FaFileAlt />, requiresAuth: true },
  // { name: "التقييم", href: "/review", icon: <FaFileAlt /> },
  // { name: "المقالات", href: "/mkalat", icon: <FaFileAlt /> },
  // { name: "العظات", href: "/3zat", icon: <FaChurch /> },
  // { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
  { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
  { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
  // { name: "القطمارس", href: "/readings", icon: <FaBook /> },
  // { name: "الخولاجي", href: "/prayers", icon: <FaBook /> },
];

const getCopticDate = () => {
  const date = new Date();
  const copticEpoch = new Date(Date.UTC(284, 7, 29));
  const diffInDays = Math.floor((date.getTime() - copticEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const copticYear = Math.floor(diffInDays / 365.25) + 1;
  const dayOfYear = diffInDays - Math.floor((copticYear - 1) * 365.25);
  const copticMonth = Math.floor(dayOfYear / 30);
  const copticDay = Math.floor(dayOfYear % 30) + 1;
  const months = ["توت", "بابة", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "نسيئ"];
  return `${copticDay} ${months[copticMonth]} ${copticYear} ش`;
};

export default function HomeClient() {
  const [showMenu, setShowMenu] = useState(false);
  const [logoPos, setLogoPos] = useState("center");
  const eagleControls = useAnimation();
  const [lastUpdate, setLastUpdate] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [commitCount, setCommitCount] = useState(0);
  const [copticDate, setCopticDate] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showExploreHint, setShowExploreHint] = useState(false);
  const [menuRadius, setMenuRadius] = useState(135);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCopticDate(getCopticDate());

    // فحص تسجيل الدخول
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    if (window.location.hash) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user);
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 1024);
      if (w >= 1024) setMenuRadius(240);
      else if (w >= 768) setMenuRadius(190);
      else if (w >= 400 && h >= 700) setMenuRadius(125);
      else setMenuRadius(105);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchLastCommit = async () => {
      try {
        const baseApiUrl = "https://api.github.com/repos/Peter-Eshak-Abdo/abona-faltaus";
        // const baseApiUrl = process.env.GITHUB_API_URL;
        const commitRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=5`);
        if (!commitRes.ok) throw new Error("Failed to fetch");

        const commits = await commitRes.json();

        if (commits && commits.length > 0) {
          const myCommit = commits.find((c: any) => !c.commit.author.name.includes('dependabot')) || commits[0];
          const commitObj = myCommit.commit;
          const commitDate = new Date(commitObj.committer.date);

          setLastUpdate(commitDate.toLocaleString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }));
          setLastMessage(commitObj.message);
        }

        const countRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=1`);
        const linkHeader = countRes.headers.get('link');
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) setCommitCount(parseInt(match[1], 10));
        } else {
          const allCommits = await countRes.json();
          setCommitCount(allCommits.length);
        }
      } catch (error) {
        setLastUpdate("وضع الأوفلاين");
        setLastMessage("لا يوجد اتصال بالإنترنت لجلب التحديثات");
      }
    };

    fetchLastCommit();
  }, []);

  useEffect(() => {
    if (showMenu) {
      eagleControls.start({
        y: ["-50%", "calc(-50% - 15px)", "-50%"],
        rotate: [0, 2, -2, 0],
        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
      });
    }
  }, [showMenu, eagleControls]);

  const toggleMenu = () => {
    if (showExploreHint) {
      setShowExploreHint(false);
      localStorage.setItem("hasSeenExploreHint", "true");
    }
    setShowMenu((prev) => !prev);
    setLogoPos((prev) => (prev === "center" ? "bottom" : "center"));
    // إضافة إهتزاز خفيف للأجهزة المدعومة
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <motion.div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* <LogoHeader />
      <UserHeader /> */}
      <Background />
      <Widgets showMenu={showMenu} />

      {/* <div className="relative z-20 w-dvw h-dvh"> */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
        <div className="pointer-events-auto">
          <LogoHeader />
          {user && < UserHeader />}
        </div>
        {/* تنبيه تسجيل الدخول بجوجل */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
          >
            <Link href="/auth/signin">
              <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-lg px-1 py-0.5 rounded-full flex items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform text-xs sm:text-sm">
                <FaGoogle className="text-blue-500" />
                <span className="font-bold text-gray-800 dark:text-gray-200">سجل دخولك بحساب جوجل لحفظ تقدمك</span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Center Logo */}
        <motion.div
          className={`z-30 absolute flex items-center justify-center pointer-events-auto group ${!showMenu ? 'animate-breathe' : ''}`}
          initial={
            isMobile
              ? { top: "48%", left: "50%", x: "-50%", y: "-50%", scale: 1 }
              : { top: "40%", left: "40%", x: "-50%", y: "-50%", scale: 1 }
          }
          animate={
            logoPos === "center"
              ? isMobile
                ? { top: "40%", left: "31%", x: "-50%", y: "-50%", scale: 1 }
                : { top: "40%", left: "40%", x: "-50%", y: "-50%", scale: 1 }
              : { top: "90%", left: "50%", x: "-50%", y: "-50%", scale: 0.35 }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100 mix-blend-screen pointer-events-none"></div>
          <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl opacity-50 scale-75 animate-pulse pointer-events-none"></div>

          <motion.button
            onClick={toggleMenu}
            whileTap={{ scale: 0.90 }}
            className="rounded-full bg-transparent shadow-[0_8px_32px_rgba(74,0,18,0.2)] relative focus:outline-none transition-transform duration-500 z-10"
            style={{ outline: "none" }}
          >
            <Image src="/images/logo.webp" alt="Logo" width={250} height={250} className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 border-blue-300" priority loading="eager" />
          </motion.button>
        </motion.div>

        {logoPos === "center" && showExploreHint && !showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-[65%] md:top-[70%] lg:top-[75%] left-1/2 -translate-x-1/2 z-10 bg-blue-600/90 text-white px-1 py-1.5 rounded-full text-sm md:text-base font-bold shadow-lg backdrop-blur-sm pointer-events-none whitespace-nowrap"
          >
            انقر للاستكشاف
          </motion.div>
        )}

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8 }}
              className={`absolute ${isMobile ? 'top-[48%] left-[29%]' : 'top-[58%] left-[34%]'} z-10 flex items-center justify-center pointer-events-none`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <motion.div animate={eagleControls} className="w-[50vw] max-w-12.25 md:max-w-18.75 lg:max-w-25">
                <Image src="/images/eagle.webp" alt="Eagle" width={400} height={266} className="w-full h-auto" priority />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMenu &&
            sections.map((section, index) => {
              const angle = (index / sections.length) * 2 * Math.PI;
              const x = Math.cos(angle) * menuRadius;
              const y = Math.sin(angle) * menuRadius;
              const isLocked = section.requiresAuth && !user;
              return (
                <motion.div
                  key={section.name}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ x, y, opacity: 1, scale: 1 }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15, delay: index * 0.04 }}
                  className={`absolute ${isMobile ? 'top-[42%] left-[44%]' : 'top-[49%] left-[45%]'} z-20 pointer-events-auto`}
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  {isLocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.error("برجاء تسجيل الدخول أولاً");
                      }}
                      title="برجاء تسجيل الدخول أولاً"
                      className="bg-gray-400/90 dark:bg-gray-700/90 backdrop-blur-md rounded-full w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex flex-col items-center justify-center text-center shadow-md border border-gray-400 dark:border-gray-600 transition-all duration-300 cursor-not-allowed text-gray-200 dark:text-gray-400 group relative overflow-hidden opacity-75 grayscale"
                    >
                      <div className="text-xl md:text-2xl lg:text-3xl z-10">{section.icon}</div>
                      <div className="leading-tight text-[9px] md:text-[11px] lg:text-xs font-bold z-10 px-1">{section.name}</div>
                    </button>
                  ) : (
                    <Link href={section.href}>
                      <div className="hover:bg-blue-500 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-full w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex flex-col items-center justify-center text-center shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 cursor-pointer hover:scale-110 text-gray-800 dark:text-gray-200 hover:text-white group relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="text-xl md:text-2xl lg:text-3xl z-10">{section.icon}</div>
                        <div className="leading-tight text-[9px] md:text-[11px] lg:text-xs font-bold z-10 px-1">{section.name}</div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
        {!showMenu && !isMobile &&
          <footer className="absolute text-start mt-1 text-xs md:text-sm opacity-80 bottom-2 ltr:left-2 rtl:right-2 z-0 pointer-events-none">
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-amber-600 dark:text-amber-400">التاريخ القبطي: {copticDate}</p>
              <p><strong>آخر تحديث:</strong> {lastUpdate || "..."}</p>
              {lastMessage && <p className="italic opacity-70 border-r-2 border-primary pr-1">"{lastMessage}"</p>}
              <p className="text-[10px]">إجمالي التحديثات: <span className="font-bold text-blue-500">{commitCount}</span></p>
            </div>
          </footer>
        }
      </div>
    </motion.div>
  );
}
