export default function Loading() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
              <p className="mt-3">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
