"use client";
export default function ChapterSelect({ count, onSelect }) {
  return (
    <select className="form-select" onChange={(e) => onSelect(e.target.value)}>
      <option value="">الإصحاح...</option>
      {Array.from({ length: count }).map((_, i) => (
        <option key={i} value={i}>
          {i + 1}
        </option>
      ))}
    </select>
  );
}
