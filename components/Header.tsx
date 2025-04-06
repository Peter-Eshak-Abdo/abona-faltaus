import Link from "next/link";

function Header() {
  return (
<>
    <header data-bs-theme="dark">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid d-flex justify-content-between">
          <a className="navbar-brand" href="#">
            <img src="./images/img.jpg" alt="صورة لابونا فلتاؤس" className=" rounded d-inline-block align-text-center mx-2" width={60} height={40} />
            أبونا فلتاؤس
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="تبديل التنقل"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link href={"/"} className="nav-link active">
                  {/* aria-current="page" */}
                  الصفحة الرئيسية
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/al7an"} className="nav-link active">
                  الحان
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/tranim"} className="nav-link active">
                  ترانيم
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/3zat"} className="nav-link active">
                  عظات
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/ayat"} className="nav-link active">
                  آيات
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/mkalat"} className="nav-link active">
                  مقالات
                </Link>
              </li>
            </ul>
            {/* <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="بحث" aria-label="بحث" />
              <button className="btn btn-outline-success" type="submit">
                بحث
              </button>
            </form> */}
          </div>
        </div>
      </nav>
      </header>
      <br className="my-5" /><br className="my-5" /><br className="my-5" />
    </>
  );
}

export default Header;
