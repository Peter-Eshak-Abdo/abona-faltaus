"use client";
export default function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      className="form-control mb-3"
      placeholder="بحث بالكلمة..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
