"use client";
import { useState } from "react";
import Link from "next/link";
// import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";

type Hymn = { monasba: string; name: string; [key: string]: unknown };
const monasbat = Object.keys(
  (al7anData as unknown as Hymn[]).reduce((acc, c) => ({ ...acc, ...c }), {})
);

export default function Al7anClient() {
  const [search, setSearch] = useState("");
  const filtered = monasbat.filter((m) => m.includes(search));
  return (
    <div className="container">
      <h1>المناسبات</h1>
      <input
        className="form-control mb-3"
        placeholder="ابحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="row">
        {filtered.map((m) => (
          <div key={m} className="col-md-4 mb-3">
            <div className="card p-3">
              <h5>{m}</h5>
              <Link href={`/al7an/${m}`} className="btn btn-primary">
                عرض
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
