"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import al7anData from "@/public/al7an-all.json";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Hymn = { monasba: string; name: string;[key: string]: unknown };

const merged = (al7anData as unknown as Hymn[]).reduce((acc, c) => ({ ...acc, ...c }), {});
const monasbat = Object.keys(merged);

export default function Al7anClient() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      monasbat.filter((m) =>
        m.toLowerCase().replace(/\s+/g, "").includes(search.toLowerCase().replace(/\s+/g, ""))
      ),
    [search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">المناسبات</h1>
          <p className="text-sm text-muted-foreground">اختَر المناسبة وشغّل الألحان</p>
        </div>
        <div className="w-full md:w-96">
          <Input
            placeholder="ابحث عن مناسبة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <motion.div
            key={m}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, translateY: -4 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="hover:shadow-lg">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{m}</h3>
                  <Link href={`/al7an/${encodeURIComponent(m)}`}>
                    <Button size="sm">عرض</Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  عرض وألحان مناسبة {m}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
