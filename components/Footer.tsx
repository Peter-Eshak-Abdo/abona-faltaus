import Link from "next/link";

function Footer() {
  return (
    <footer className="container pt-5 mt-5">
      <hr className="featurette-divider" />
      <div className="row">
        <div className="col-6 col-md-2 mb-3">
          <h5>الآيات والمقالات الدينية</h5>
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
          <h5> قسم الالحان والترانيم والعظات</h5>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link href={"/ayat"} className="nav-link p-0 text-body-secondary">
                الآيات
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
            <p>ده طبعاً لسة مش بعرف اعملك ف سيبك من الحت ده دلوقتي وشوف باقيتة الصفحة وحلاص</p>
            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
              <label htmlFor="newsletter1" className="visually-hidden">
                ايميلك
              </label>
              <input id="newsletter1" type="text" className="form-control" placeholder="Email address" />
              <button className="btn btn-primary disabled" type="button">
                ماقلتلك ماتشتركش ياعم
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
        <p>&copy; جميع الحقوق محفوظة لدي تفاحة طبعاً.</p>
        <ul className="list-unstyled d-flex">
          <li className="ms-3">
            <a href="tel:+01221331602">01221331602</a> || <a href="tel:+01202224608">01202224608</a>
            مترنش علشان مش فاضي
          </li>
          <li className="ms-3">
            Email: <a href="mailto:petereshak11gmail.com">petereshak11gmail.com</a>يعم مش هشوفة
          </li>
          <li className="ms-3">
            <a className="text-body" href="https://wa.me/message/AOH44Q2TY3H2E1" title="Whatsapp">
              <i className="bi bi-whatsapp text-success">
                
                {/* <p className="fs-1 fw-bolder text-primary-emphasis">Whatsapp</p> */}
              </i>
            </a>
          </li>
          <li className="ms-3">
            {/* <p className="fs-1 fw-bolder text-primary-emphasis">Whatsapp</p> */}
            <a className="text-body" href="https://wa.me/qr/36KBTEORX2N3O1" title="Whatsapp">
              <i className="bi bi-whatsapp text-success-emphasis"></i>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;

