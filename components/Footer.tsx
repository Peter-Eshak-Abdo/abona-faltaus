// 'use client';
// import Link from "next/link";

// function Footer() {
//   return (
//     <footer className="container pt-5 mt-5">
//       <hr className="featurette-divider" />
//       <Link href={"/"} className="nav-link p-0 text-body fs-4 fw-bolder mb-3 text-center">
//         الصفحة الرئيسية
//       </Link>
//       <div className="row">
//         <div className="col-6 col-md-2 mb-3">
//           <h5> قسم الالحان والترانيم والعظات</h5>
//           <ul className="nav flex-column">
//             <li className="nav-item mb-2">
//               <Link
//                 href={"/al7an"}
//                 className="nav-link p-0 text-body-secondary"
//               >
//                 الحان
//               </Link>
//             </li>
//             <li className="nav-item mb-2">
//               <Link
//                 href={"/tranim"}
//                 className="nav-link p-0 text-body-secondary"
//               >
//                 ترانيم

//               </Link>
//             </li>
//             <li className="nav-item mb-2">
//               <Link href={"/3zat"} className="nav-link p-0 text-body-secondary">
//                 عظات
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div className="col-6 col-md-2 mb-3">
//           <h5>الكتاب المقدس والمقالات الدينية</h5>
//           <h6 className="text-body-secondary">عارف الصورة غلط هبقي اغيرها بعدين</h6>
//           <ul className="nav flex-column">
//             <li className="nav-item mb-2">
//               <Link href={"/bible"} className="nav-link p-0 text-body-secondary">
//                 الكتاب المقدس
//               </Link>
//             </li>
//             <li className="nav-item mb-2">
//               <Link
//                 href={"/mkalat"}
//                 className="nav-link p-0 text-body-secondary"
//               >
//                 المقالات
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div className="col-6 col-md-2 mb-3">
//           <h5> عرض فقرات</h5>
//           <ul className="nav flex-column">
//             <li className="nav-item mb-2">
//               <Link href={"#"} className="nav-link p-0 text-body-secondary">
//                 الفقرات
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div className="col-md-5 offset-md-1 mb-3">
//           <form>
//             <h5>اشترك علشان يصلك كل جديد</h5>
//             <p>
//               ده طبعاً لسة مش بعرف اعملك ف سيبك من الحته ديه دلوقتي وشوف باقيتة
//               الصفحة وخلاص
//             </p>
//             <div className="d-flex flex-column flex-sm-row w-100 gap-2">
//               <label htmlFor="newsletter1" className="visually-hidden">
//                 ايميلك
//               </label>
//               <input
//                 id="newsletter1"
//                 type="text"
//                 className="form-control"
//                 placeholder="Email address"
//               />
//               <button className="btn btn-primary disabled" type="button">
//                 ماقلتلك ماتشتركش ياعم
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
//         <a
//           href="https://tofa7a-5e936.web.app/"
//           className="link-offset-2 link-underline  link-offset-3-hover link-underline-opacity-0 link-underline-opacity-75-hover"
//         >
//           <p>&copy; جميع الحقوق محفوظة لدي تفاحة طبعاً.</p>
//         </a>
//         <ul className="list-unstyled d-flex">
//           <li className="ms-3">
//             <a href="tel:01221331602">
//               <i className="bi bi-telephone fs-1"></i>
//             </a>{" "}
//             ||{" "}
//             <a href="tel:01202224608">
//               <i className="bi bi-telephone-fill fs-1"></i>
//             </a>
//             مترنش علشان مش فاضي
//           </li>
//           <li className="ms-3">
//             Email:{" "}
//             <a href="mailto:petereshak11gmail.com">
//               <i className="bi bi-envelope fs-1"></i>
//             </a>
//             <br />
//             يعم مش هشوفة
//           </li>
//           <li className="ms-3">
//             <a
//               className="text-body"
//               href="https://wa.me/message/AOH44Q2TY3H2E1"
//               title="Whatsapp"
//             >
//               <i className="bi bi-whatsapp text-success fs-1">
//               </i>
//             </a>
//           </li>
//           <li className="ms-3">
//             <a
//               className="text-body"
//               href="https://wa.me/qr/36KBTEORX2N3O1"
//               title="Whatsapp"
//             >
//               <i className="bi bi-whatsapp text-success-emphasis fs-1"></i>
//             </a>
//           </li>
//           <li className="ms-3">
//             <a
//               href="https://tofa7a-5e936.web.app/"
//               className="link-offset-2 link-underline link-offset-3-hover link-underline-opacity-0 link-underline-opacity-75-hover"
//             >
//               <i className="bi bi-person-circle fs-1"> عن المطور</i>
//             </a>
//           </li>
//         </ul>
//       </div>
//     </footer>
//   );
// }

// export default Footer;

'use client';
import Link from "next/link";

function Footer() {
  return (
    <footer className="container">
      <hr className="featurette-divider" />

      {/* هذا القسم سيظهر فقط على الشاشات الكبيرة (md فما فوق) */}
      <div className="d-none d-md-block">
        <Link href={"/"} className="nav-link p-0 text-body fs-4 fw-bolder mb-3 text-center">
          الصفحة الرئيسية
        </Link>
        <div className="row">
          <div className="col-6 col-md-2 mb-3">
            <h5> قسم الالحان والترانيم والعظات</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link href={"/al7an"} className="nav-link p-0 text-body-secondary">
                  الحان
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link href={"/tranim"} className="nav-link p-0 text-body-secondary">
                  ترانيم
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link href={"/3zat"} className="nav-link p-0 text-body-secondary">
                  عظات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-2 mb-3">
            <h5>الكتاب المقدس والمقالات الدينية</h5>
            <h6 className="text-body-secondary">عارف الصورة غلط هبقي اغيرها بعدين</h6>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link href={"/bible"} className="nav-link p-0 text-body-secondary">
                  الكتاب المقدس
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link href={"/mkalat"} className="nav-link p-0 text-body-secondary">
                  المقالات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-2 mb-3">
            <h5> عرض فقرات</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link href={"#"} className="nav-link p-0 text-body-secondary">
                  الفقرات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-5 offset-md-1 mb-3">
            <form>
              <h5>اشترك علشان يصلك كل جديد</h5>
              <p>
                ده طبعاً لسة مش بعرف اعملك ف سيبك من الحته ديه دلوقتي وشوف باقيتة
                الصفحة وخلاص
              </p>
              <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                <label htmlFor="newsletter1" className="visually-hidden">
                  ايميلك
                </label>
                <input
                  id="newsletter1"
                  type="text"
                  className="form-control"
                  placeholder="Email address"
                />
                <button className="btn btn-primary disabled" type="button">
                  ماقلتلك ماتشتركش ياعم
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* هذا القسم سيظهر على جميع أحجام الشاشات */}
      <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
        <a
          href="https://tofa7a-5e936.web.app/"
          className="link-offset-2 link-underline link-offset-3-hover link-underline-opacity-0 link-underline-opacity-75-hover"
        >
          <p>&copy; جميع الحقوق محفوظة لدي تفاحة طبعاً.</p>
        </a>
        <ul className="list-unstyled d-flex">
          <li className="ms-3">
            <a href="tel:01221331602">
              <i className="bi bi-telephone fs-1"></i>
            </a>{" "}
            ||{" "}
            <a href="tel:01202224608">
              <i className="bi bi-telephone-fill fs-1"></i>
            </a>
            {/* مترنش علشان مش فاضي */}
          </li>
          <li className="ms-3">
            {/* Email:{" "} */}
            <a href="mailto:petereshak11gmail.com">
              <i className="bi bi-envelope fs-1"></i>
            </a>
            <br />
            {/* يعم مش هشوفة */}
          </li>
          <li className="ms-3">
            <a
              className="text-body"
              href="https://wa.me/message/AOH44Q2TY3H2E1"
              title="Whatsapp"
            >
              <i className="bi bi-whatsapp text-success fs-1"></i>
            </a>
          </li>
          <li className="ms-3">
            <a
              className="text-body"
              href="https://wa.me/qr/36KBTEORX2N3O1"
              title="Whatsapp"
            >
              <i className="bi bi-whatsapp text-success-emphasis fs-1"></i>
            </a>
          </li>
          <li className="ms-3">
            <a
              href="https://tofa7a-5e936.web.app/"
              className="link-offset-2 link-underline link-offset-3-hover link-underline-opacity-0 link-underline-opacity-75-hover"
            >
              <i className="bi bi-person-circle fs-1"> عن المطور</i>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
