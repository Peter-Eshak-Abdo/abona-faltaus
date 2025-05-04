// "use client";
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { FaMusic, FaBook, FaChurch, FaFileAlt, FaClipboardList, FaPenFancy, FaPlayCircle } from "react-icons/fa";

// const sections = [
//   { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
//   { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
//   { name: "العظات", href: "/3zat", icon: <FaChurch /> },
//   { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
//   { name: "المقالات", href: "/", icon: <FaFileAlt /> },
//   { name: "الفقرات", href: "/fqrat", icon: <FaClipboardList /> },
//   { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
// ];

// export default function Home() {
//   const [loadingSplach, setLoadingSplach] = useState(true);
//   // const [autoRotate, setAutoRotate] = useState(true);
//   // const [rotation, setRotation] = useState(0);
//   const [showMenu, setShowMenu] = useState(false);

//   const radius = 150;

//   // useEffect(() => {
//   //   if (!autoRotate) return;

//   //   const interval = setInterval(() => {
//   //     setRotation((prev) => prev + 0.5);
//   //   }, 20); // سرعة الدوران

//   //   return () => clearInterval(interval);
//   // }, [autoRotate]);

//   useEffect(() => {
//     const timer = setTimeout(() => setLoadingSplach(false), 2500); // 2 ثواني
//     return () => clearTimeout(timer);
//   }, []);

//   if (loadingSplach) {
//     return (
//       <div className="d-flex vh-100 justify-content-center align-items-center bg-white">
//         <Image src="/images/logo.jpg" width={150} height={150} alt="Logo" />
//         <h2 className="ms-3 text-primary">جاري التحميل...</h2>
//       </div>
//     );
//   }

//   return (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1 }}
//         >
//           <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-4 flex items-center gap-3 shadow-lg border border-white/20 w-[300px] justify-center z-30">
//             <Image
//               src="/images/logo.jpg"
//               alt="logo"
//               width={80}
//               height={80}
//             />
//             <span className="text-black text-lg font-semibold fw-bolder">ابونا فلتاؤس السرياني</span>
//           </div>
//           <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">

//             <AnimatePresence>
//               {sections.map((section, index) => {
//                 const angle = (index / sections.length) * 2 * Math.PI;
//                 const x = Math.cos(angle) * radius;
//                 const y = Math.sin(angle) * radius;

//                 return showMenu ? (
//                   <motion.div
//                     key={section.name}
//                     initial={{ x: 0, y: 0, opacity: 0 }}
//                     animate={{ x, y, opacity: 1 }}
//                     exit={{ x: 0, y: 0, opacity: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.05 }}
//                     className="absolute"
//                     style={{ top: "48%", left: "41%", transform: "translate(-50%, -50%)" }}
//                   >
//                     <Link href={section.href}>
//                       <motion.div className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center text-center shadow-lg border border-gray-600 transition-all duration-300 cursor-pointer">
//                         <div className="text-xl">{section.icon}</div>
//                         <div className="text-xs mt-1">{section.name}</div>
//                       </motion.div>
//                     </Link>
//                   </motion.div>
//                 ) : null;
//               })}
//             </AnimatePresence>

//             <motion.button
//               onClick={() => setShowMenu(!showMenu)}
//               className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-600 to-purple-800 text-white text-2xl font-bold flex items-center justify-center shadow-lg border-4 border-purple-900 z-10"
//               whileTap={{ scale: 0.95 }}
//               initial={{ scale: 1 }}
//               animate={{ rotate: showMenu ? 90 : 0, transition: { duration: 0.5 } }}
//             >
//               <Image
//                 src="/images/logo.jpg" // غيّر حسب مكان صورتك
//                 alt="لوجو البرنامج"
//                 width={175}
//                 height={175}
//                 className="rounded-full"
//               />
//             </motion.button>
//           </div>
//         </motion.div>
//   );
// }
// ---------------------------------------------------------------------------------------------------------------------------------------
// "use client";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { FaMusic, FaBook, FaChurch, FaFileAlt, FaClipboardList, FaPenFancy, FaPlayCircle } from "react-icons/fa";

// const sections = [
//   { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
//   { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
//   { name: "العظات", href: "/3zat", icon: <FaChurch /> },
//   { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
//   { name: "المقالات", href: "/", icon: <FaFileAlt /> },
//   { name: "الفقرات", href: "/", icon: <FaClipboardList /> },
//   { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
// ];

// export default function Home() {
//   const [showMenu, setShowMenu] = useState(false);
//   const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

//   // interface CursorPosition {
//   //   x: number;
//   //   y: number;
//   // }

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
//     setCursorPos({ x: e.clientX, y: e.clientY });
//   };

//   return (
//     <motion.div
//       className="min-h-screen bg-gradient-to-b from-white to-blue-100 flex items-center justify-center relative overflow-hidden"
//       onMouseMove={handleMouseMove}
//     >
//       {/* نسر وريشة تظهر بعد الضغط */}
//       <AnimatePresence>
//         {showMenu && (
//           <>
//             <motion.div
//               initial={{ opacity: 0, scale: 0.5 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 1 }}
//               className="absolute top-10 left-1/2 -translate-x-1/2 z-10"
//             >
//               <Image
//                 src="/images/eagle.png"
//                 alt="نسر"
//                 width={200}
//                 height={200}
//                 className="transition-transform duration-500"
//                 style={{
//                   transform: `rotate(${(cursorPos.x - window.innerWidth / 2) / 30}deg)`,
//                 }}
//               />
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1, duration: 0.8 }}
//               className="absolute top-[250px] left-1/2 -translate-x-1/2 z-10"
//             >
//               <Image
//                 src="/images/feather.png"
//                 alt="ريشة"
//                 width={120}
//                 height={120}
//               />
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* الأيقونات */}
//       <AnimatePresence>
//         {showMenu &&
//           sections.map((section, index) => (
//             <motion.div
//               key={section.name}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
//               className="absolute"
//               style={{
//                 top: `${60 + index * 50}px`,
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 zIndex: 9,
//               }}
//             >
//               <Link href={section.href}>
//                 <div className="bg-white hover:bg-blue-50 text-black rounded-xl px-6 py-3 flex items-center gap-3 shadow-lg border border-gray-300">
//                   <div className="text-xl">{section.icon}</div>
//                   <div>{section.name}</div>
//                 </div>
//               </Link>
//             </motion.div>
//           ))}
//       </AnimatePresence>

//       {/* اللوجو المركزي */}
//       <motion.button
//         onClick={() => setShowMenu(!showMenu)}
//         whileTap={{ scale: 0.95 }}
//         className="z-20 rounded-full bg-white border-4 border-blue-300 p-6 shadow-xl"
//       >
//         <Image
//           src="/images/logo.jpg"
//           alt="اللوجو"
//           width={100}
//           height={100}
//           className="rounded-full"
//         />
//       </motion.button>
//     </motion.div>
//   );
// }
//  ---------------------------------------------------------------------------------------------------------------------------------------
"use client";
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
} from "react-icons/fa";
import LogoHeader from "@/components/LogoHeader";

const sections = [
  { name: "الألحان", href: "/al7an", icon: <FaMusic /> },
  { name: "الترانيم", href: "/tranim", icon: <FaPlayCircle /> },
  { name: "العظات", href: "/3zat", icon: <FaChurch /> },
  { name: "الكتاب المقدس", href: "/bible", icon: <FaBook /> },
  { name: "المقالات", href: "/mkalat", icon: <FaFileAlt /> },
  { name: "الامتحانات", href: "/exam", icon: <FaPenFancy /> },
];

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [logoPos, setLogoPos] = useState("center");
  // const [radius, setRadius] = useState(150);

  const eagleControls = useAnimation();

  useEffect(() => {
    // const updateRadius = () => {
    //   const screenWidth = window.innerWidth;
    //   setRadius(screenWidth < 500 ? 150 : screenWidth < 768 ? 175 : 350);
    // };

    // updateRadius();
    // window.addEventListener("resize", updateRadius);
    // return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // حركة تلقائية مستمرة للنسر
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
      {/* <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden"> */}

      {/* اللوجو الأساسي */}
      <motion.div
        className="z-20 rounded-full border-blue-300 p-4 shadow-xl absolute"
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
              scale: 0.35,
            }
        }
        transition={{ duration: 0.8 }}
      >
        <motion.button onClick={toggleMenu} whileTap={{ scale: 0.95 }}>
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={200}
            height={200}
            className="rounded-full border-4 border-blue-300"
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
        {/*  <motion.div
             className="absolute z-10"
             style={{
               top: "50%",
               left: "50%",
               transform: "translate(-50%, -50%)",
               pointerEvents: "none", // علشان ميبقاش فوق الأزرار
             }}
             animate={eagleControls}
             initial={{ opacity: 0, scale: 0.8 }}
             transition={{ duration: 0.8 }}
           >
             <Image
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Eagle_in_flight_%28cropped%29.jpg/640px-Eagle_in_flight_%28cropped%29.jpg"
               // src="/images/eagle.png"
               alt="Eagle"
               width={180}
               height={180}
               className="object-contain border border-red-500"
             />
           </motion.div>*/}

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
    </motion.div>
  );
}
