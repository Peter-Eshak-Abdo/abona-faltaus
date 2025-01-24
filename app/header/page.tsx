function Header() {
  return (
    <header data-bs-theme="dark">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
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
                <a className="nav-link active" aria-current="page" href="#">
                  الصفحة الرئيسية
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  الحان
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true">
                  آيات
                </a>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="بحث" aria-label="بحث" />
              <button className="btn btn-outline-success" type="submit">
                بحث
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
