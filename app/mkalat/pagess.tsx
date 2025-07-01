'use client';
import CreateMkal from "@/components/CreateMkal";
import MkalatFeed from "@/components/MkalatFeed";

export default function ArticlesPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">المقالات</h1>
      <CreateMkal />
      <div className="mt-6">
        <MkalatFeed />
      </div>
    </div>
  );
}
