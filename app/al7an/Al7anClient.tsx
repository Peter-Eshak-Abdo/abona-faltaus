"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import al7anData from "@/public/al7an-all.json";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// import { monasbat } from "@/lib/al7an";

type Hymn = { monasba: string; name: string;[key: string]: unknown };

const merged = (al7anData as unknown as Hymn[]).reduce((acc, c) => ({ ...acc, ...c }), {});
const monasbat = Object.keys(merged);

export default function Al7anClient({ params }: { params: Promise<{ mons: string }> }) {
  const [search, setSearch] = useState("");
  const [mons, setMons] = useState("");
  const filtered = useMemo(
    () =>
      monasbat.filter((m) =>
        m.toLowerCase().replace(/\s+/g, "").includes(search.toLowerCase().replace(/\s+/g, ""))
      ),
    [search]
  );

  useEffect(() => {
    params.then(({ mons }) => setMons(mons));
  }, [params]);

  const monasba = monasbat[mons as keyof typeof monasbat] as string;
  return (
    <div className="space-y-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
        <div>
          <h1 className="text-3xl font-extrabold">المناسبات </h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {filtered.map((m) => (
          <motion.div
            key={m}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, translateY: -4 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="hover:shadow-lg">
              <CardContent className="p-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{m} {monasba}</h3>
                  <Link href={`/al7an/${encodeURIComponent(m)}`}>
                    <Button size="normal">عرض</Button>
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
