"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import slugify from "slugify";

type Hymn = { name: string; duration?: string };
export default function MonasbaListClient({ hymns, monasba }: { hymns: Hymn[]; monasba: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
      {hymns.map((h) => {
        const slug = slugify(h.name, { lower: true, strict: true });
        return (
          <motion.div
            key={slug}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.18 }}
            className="bg-white border rounded-lg p-1 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{h.name}</div>
              {h.duration && <div className="text-xs text-muted-foreground">المدة: {h.duration}</div>}
            </div>
            <div className="flex items-center gap-1">
              <Link href={`/al7an/${encodeURIComponent(monasba)}/${slug}`}>
                <Button size="normal">تفاصيل</Button>
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
