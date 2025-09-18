"use client";
import { useState } from "react";
import Link from "next/link";
// import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Hymn = { monasba: string; name: string; [key: string]: unknown };
const monasbat = Object.keys(
  (al7anData as unknown as Hymn[]).reduce((acc, c) => ({ ...acc, ...c }), {})
);

export default function Al7anClient() {
  const [search, setSearch] = useState("");
  const filtered = monasbat.filter((m) => m.includes(search));
  return (
    <div className="max-w-7xl mx-auto">
      <h1>المناسبات</h1>
      <Input
        placeholder="ابحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <Card key={m}>
            <CardContent className="p-3">
              <h5>{m}</h5>
              <Link href={`/al7an/${m}`}>
                <Button>عرض</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
