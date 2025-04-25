"use client";
export default function BookSelect({ bible, onSelect }) {
  return (
    <select className="form-select" onChange={(e) => onSelect(e.target.value)}>
      <option value="">اختر السفر...</option>
      {bible.map((b, i) => (
        <option key={i} value={i}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
