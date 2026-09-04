"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FaMusic,
  FaBook,
  FaChurch,
  FaFileAlt,
  FaPenFancy,
  FaCog,
  FaGoogle,
  FaSun,
  FaPray,
  FaBookOpen,
} from "react-icons/fa";
import dynamicImport from "next/dynamic";
import LogoHeader from "./LogoHeader";
import UserHeader from "./UserHeader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Widgets from "./Widgets";
import { Trophy } from "lucide-react";

const Background = dynamicImport(() => import("./Background"), { ssr: false });
const MysteriousExperience = dynamicImport(() => import("./MysteriousExperience").then(m => m.MysteriousExperience), { ssr: false });
const ServantOnboardingTour = dynamicImport(() => import("./ServantOnboardingTour"), { ssr: false });

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
  const t = useTranslations("Home");
  const sections = useMemo(
    () => [
      { name: t("sections.liturgies"), href: "/liturgies", icon: <FaChurch /> },
      { name: t("sections.tasbeha"), href: "/tasbeha", icon: <FaMusic /> },
      { name: t("sections.hymns"), href: "/al7an", icon: <FaMusic /> },
      { name: t("sections.bible"), href: "/bible", icon: <FaBookOpen /> },
      { name: t("sections.agpeya"), href: "/agpeya", icon: <FaPray /> },
      { name: t("sections.synaxarium"), href: "/synaxarium", icon: <FaSun /> },
      { name: t("sections.preparation"), href: "/preparation", icon: <FaFileAlt /> },
      { name: t("sections.exams"), href: "/exam/quiz/dashboard", icon: <FaPenFancy /> },
      { name: "استبيانات واستمارات الخدمة", href: "/forms", icon: <FaFileAlt /> },
      { name: "صندوق الصراحة والأسئلة", href: "/saraha", icon: <FaChurch /> },
      { name: t("sections.chat"), href: "/chat", icon: <FaFileAlt />, requiresAuth: true },
      { name: t("sections.settings"), href: "/settings", icon: <FaCog /> },
    ],
    [t],
  );
  const [showMenu, setShowMenu] = useState(false);
  const [logoPos, setLogoPos] = useState("center");
  const eagleControls = useAnimation();
  const [lastUpdate, setLastUpdate] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [commitCount, setCommitCount] = useState(0);
  const [copticDate, setCopticDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showExploreHint, setShowExploreHint] = useState(false);
  const [menuRadius, setMenuRadius] = useState(135);
  const [isMobile, setIsMobile] = useState(false);
  const [quizLevel, setQuizLevel] = useState(1);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("church_quiz_user_profile");
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        if (parsed.currentLevel) setQuizLevel(parsed.currentLevel);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
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
      // فحص الكاش المؤقت لبيانات التحديث
      const cachedCommit = localStorage.getItem("github_commit_cache");
      if (cachedCommit) {
        try {
          const { update, message, count, timestamp } = JSON.parse(cachedCommit);
          if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 دقيقة
            if (update) setLastUpdate(update);
            if (message) setLastMessage(message);
            if (count) setCommitCount(count);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const baseApiUrl = "https://api.github.com/repos/Peter-Eshak-Abdo/abona-faltaus";
        const commitRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=5`);
        if (!commitRes.ok) throw new Error("Failed to fetch");

        const commits = await commitRes.json();
        let formattedDate = "";
        let messageText = "";
        let totalCommits = 0;

        if (commits && commits.length > 0) {
          const myCommit = commits.find((c: any) => !c.commit.author.name.includes('dependabot')) || commits[0];
          const commitObj = myCommit.commit;
          const commitDate = new Date(commitObj.committer.date);

          formattedDate = commitDate.toLocaleString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          });
          messageText = commitObj.message;

          setLastUpdate(formattedDate);
          setLastMessage(messageText);
        }

        const countRes = await fetch(`${baseApiUrl}/commits?sha=main&per_page=1`);
        const linkHeader = countRes.headers.get('link');
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            totalCommits = parseInt(match[1], 10);
            setCommitCount(totalCommits);
          }
        } else {
          const allCommits = await countRes.json();
          totalCommits = allCommits.length;
          setCommitCount(totalCommits);
        }

        localStorage.setItem("github_commit_cache", JSON.stringify({
          update: formattedDate,
          message: messageText,
          count: totalCommits,
          timestamp: Date.now()
        }));
      } catch (error) {
        setLastUpdate(t("offlineStatus"));
        setLastMessage(t("offlineMessage"));
      }
    };

    fetchLastCommit();
  }, [t]);

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
    <motion.div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center">
      {/* <LogoHeader />
      <UserHeader /> */}
      <Background />
      <Widgets showMenu={showMenu} />
      <MysteriousExperience />

      {/* Standalone Individual Exam Button with Level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-20 left-4 z-30 pointer-events-auto"
      >
        <Link href="/exam/individual-questions">
          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border border-amber-500/40 shadow-xl px-0.5 py-0.5 rounded-2xl flex items-center gap-0.5 hover:scale-105 transition-all text-xs sm:text-sm group">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy size={16} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-right">
              <div className="font-bold text-stone-800 dark:text-zinc-200">الامتحان الفردي</div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                المستوى {quizLevel}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* <div className="relative z-20 w-dvw h-dvh"> */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
        <div className="pointer-events-auto">
          <LogoHeader />
          {mounted && user && <UserHeader user={user} />}
        </div>
        {/* تنبيه تسجيل الدخول بجوجل */}
        {mounted && !user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
          >
            <Link href="/auth/signin">
              <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-lg px-1 py-0.5 rounded-full flex items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform text-xs sm:text-sm">
                <FaGoogle className="text-blue-500" />
                <span className="font-bold text-gray-800 dark:text-gray-200">{t("signInGoogle")}</span>
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
            {t("exploreHint")}
          </motion.div>
        )}

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8 }}
              className={`absolute ${isMobile ? 'top-[48%] left-[29%]' : 'top-[55%] left-[37%]'} z-10 flex items-center justify-center pointer-events-none`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <motion.div animate={eagleControls} className="w-[50vw] max-w-12.25 md:max-w-18.75 lg:max-w-25">
                <Image src="/images/eagle.webp" alt="Eagle" width={400} height={266} className="w-full h-auto" priority loading="eager" />
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
                        toast.error(t("loginRequired"));
                      }}
                      title={t("loginRequired")}
                      className="bg-gray-400/90 dark:bg-gray-700/90 backdrop-blur-md rounded-full w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex flex-col items-center justify-center text-center shadow-md border border-gray-400 dark:border-gray-600 transition-all duration-300 cursor-not-allowed text-gray-200 dark:text-gray-400 group relative overflow-hidden opacity-75 grayscale"
                    >
                      <div className="text-xl md:text-2xl lg:text-3xl z-10">{section.icon}</div>
                      <div className="leading-tight text-[9px] md:text-[11px] lg:text-xs font-bold z-10 px-1">{section.name}</div>
                    </button>
                  ) : (
                    <Link href={section.href} prefetch={true}>
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
          <footer className="absolute text-start mt-1 text-xs md:text-sm opacity-80 bottom-1 ltr:left-1 rtl:right-1 z-0 pointer-events-none w-full">
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-amber-600 dark:text-amber-400">{t("copticDate", { date: copticDate })}</p>
              <p><strong>{t("lastUpdate")}</strong> {lastUpdate || "..."}</p>
              {lastMessage && <p className="italic opacity-70 border-r-2 border-primary pr-0.25">"{lastMessage}"</p>}
              <p className="text-[10px]">{t("totalUpdates")} <span className="font-bold text-blue-500">{commitCount}</span></p>
            </div>
            <div className="flex justify-center gap-0.25 pointer-events-auto">
              <Link href="/privacy" className="hover:underline">{t("privacy")}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">{t("terms")}</Link>
              <span>•</span>
              <Link href="/about" className="hover:underline">{t("about")}</Link>
            </div>
            <p className="mt-0.5 flex justify-end pe-2">{t("copyright", { year: new Date().getFullYear() })}</p>
          </footer>
        }
      </div>
      <ServantOnboardingTour />
    </motion.div>
  );
}
