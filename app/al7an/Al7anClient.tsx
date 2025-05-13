"use client";

import { useState } from "react";
import Link from "next/link";
import al7anData from "@/public/al7an-all.json";

export default function Al7anClient() {
  const monasbat = Object.keys(
    al7anData.reduce((acc, item) => ({ ...acc, ...item }), {})
  );

  const [search, setSearch] = useState("");

  const filteredMonasbat = monasbat.filter((monasba) =>
    monasba.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>المناسبات</h1>
      <input
        type="text"
        className="form-control mb-4"
        placeholder="ابحث عن المناسبة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="row">
        {filteredMonasbat.length > 0 ? (
          filteredMonasbat.map((monasba) => (
            <div key={monasba} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <h5 className="card-title">{monasba}</h5>
                  <Link href={`/al7an/${monasba}`} className="btn btn-primary mt-3">
                    عرض الألحان
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>لا توجد مناسبات مطابقة للبحث.</p>
        )}
      </div>
    </div>
  );
}
