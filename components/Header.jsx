// 'use client';
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from 'next/navigation';
// import clsx from 'clsx';
// import { Menu } from 'lucide-react';
// import { useState } from 'react';

// const links = [
//   { name: 'الصفحة الرئيسية', href: '/' },
//   { name: 'الحان', href: '/al7an' },
//   { name: 'ترانيم', href: '/tranim' },
//   { name: 'عظات', href: '/3zat' },
//   { name: 'الكتاب المقدس', href: '/bible' },
//   { name: 'مقالات', href: '/mkalat' },
// ];


// function Header() {
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       {/* <header data-bs-theme="dark">
//       <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
//         <div className="container-fluid d-flex justify-content-between">
//           <a className="navbar-brand" href="#">
//             <Image src="/images/img.jpg" alt="صورة لابونا فلتاؤس" className="rounded d-inline-block align-text-center mx-2" width={60} height={40} />
//             أبونا فلتاؤس
//           </a>
//           <button
//             className="navbar-toggler"
//             type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#navbarCollapse"
//             aria-controls="navbarCollapse"
//             aria-expanded="false"
//             aria-label="تبديل التنقل"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>
//           <div className="collapse navbar-collapse" id="navbarCollapse">
//             <ul className="navbar-nav me-auto mb-2 mb-md-0">
//               <li className="nav-item">
//                 <Link href={"/"} className="nav-link active">
//                   الصفحة الرئيسية
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link href={"/al7an"} className="nav-link active">
//                   الحان
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link href={"/tranim"} className="nav-link active">
//                   ترانيم
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link href={"/3zat"} className="nav-link active">
//                   عظات
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link href={"/ayat"} className="nav-link active">
//                   آيات
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link href={"/mkalat"} className="nav-link active">
//                   مقالات
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
//       </header>
//       <br className="my-5" /><br className="my-5" /><br className="my-5" /> */}
//       {/* <header data-bs-theme="dark">
//         <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
//           <div className="container-fluid d-flex justify-content-between">
//             <a className="navbar-brand" href="#">
//               <Image src="/images/img.jpg" alt="صورة لابونا فلتاؤس" className="rounded d-inline-block align-text-center mx-2" width={60} height={40} />
//               أبونا فلتاؤس
//             </a>
//             <button
//               className="navbar-toggler"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#navbarCollapse"
//               aria-controls="navbarCollapse"
//               aria-expanded="false"
//               aria-label="تبديل التنقل"
//             >
//               <span className="navbar-toggler-icon"></span>
//             </button>
//             <div className="collapse navbar-collapse" id="navbarCollapse">
//               <ul className="navbar-nav me-auto mb-2 mb-md-0">
//               {links.map((link) => (
//                 <li key={link.name} className="nav-item">
//                   <Link
//                     href={link.href}
//                     className={clsx(
//                       "d-flex h-auto flex-grow-1 align-items-center justify-content-center gap-2 rounded bg-light p-3 text-sm fw-medium hover:bg-sky-100 hover:text-blue-600 d-md-flex-none d-md-justify-start d-md-p-2 d-md-px-3", {
//                       'bg-sky-100 text-blue-600': pathname === link.href,
//                     })}
//                   >
//                     <p className="text-light">{link.name}</p>
//                   </Link>
//                 </li>
//               ))}
//               </ul>
//             </div>
//           </div>
//         </nav>
//       </header> */}
//       <header className="bg-sky-900 text-white shadow-md fixed top-0 w-full z-50">
//         <div className="container mx-auto flex justify-between items-center p-4">
//           <Link href="/" className="flex items-center gap-2">
//             <Image
//               src="/images/logo.jpg"
//               alt="لوجو لابونا فلتاؤس"
//               width={50}
//               height={40}
//               className="rounded"
//             />
//             <span className="text-lg font-semibold">أبونا فلتاؤس</span>
//           </Link>

//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
//             title="Toggle navigation"
//           >
//             <Menu className="w-6 h-6" />
//           </button>

//           <nav
//             className={clsx(
//               "flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-4 md:mt-0 rtl",
//               {
//                 'hidden md:flex': !isOpen,
//                 'flex': isOpen,
//               }
//             )}
//           >
//             {links.map((link) => (
//               <Link
//                 key={link.name}
//                 href={link.href}
//                 className={clsx(
//                   "text-sm md:text-base font-medium px-4 py-2 rounded transition",
//                   {
//                     'bg-blue-600 text-white': pathname === link.href,
//                     'text-gray-300 hover:text-white hover:bg-gray-700': pathname !== link.href,
//                   }
//                 )}
//               >
//                 {link.name}
//               </Link>
//             ))}
//           </nav>
//         </div>
//       </header>
//       <div className="my-5" /><div className="my-5" /><div className="my-5" />
//     </>
//   );
// }

// export default Header;

'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { name: 'الصفحة الرئيسية', href: '/' },
  { name: 'الحان', href: '/al7an' },
  { name: 'ترانيم', href: '/tranim' },
  { name: 'عظات', href: '/3zat' },
  { name: 'الكتاب المقدس', href: '/bible' },
  { name: 'مقالات', href: '/mkalat' },
];

function Header() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.remove('fade-in');
      void main.offsetWidth; // trigger reflow
      main.classList.add('fade-in');
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = Math.max(1 - scrollY / 200, 0.4); // يبدأ بـ 1 ويقل تدريجياً لحد 0.4
  return (
    <>
      <nav
        className="navbar navbar-expand-lg fixed-top shadow-sm"
        style={{
          backgroundColor: `rgba(13, 110, 253, ${opacity})`, // Bootstrap primary color مع شفافية
          transition: 'background-color 0.3s ease',
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
                transition: 'transform 0.5s ease-in-out',
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
            aria-expanded={!isCollapsed ? 'true' : 'false'}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={` navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {links.map((link) => (
                <li className="nav-item" key={link.name}>
                  <Link className="nav-link text-white fw-semibold" href={link.href}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer تحت الـNavbar عشان ميغطيش المحتوى */}
      <div style={{ height: '80px' }} />
    </>
  );
}
export default Header;
