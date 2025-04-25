"use client";
import SearchInput from "./SearchInput";
export default function Controls({
  search,
  onSearch,
  fontSize,
  onFontIncrease,
  onFontDecrease,
  onRead,
  onBookmark,
}) {
  return (
    <div className="row mb-3 gy-2">
      <div className="col-md-4">
        <SearchInput value={search} onChange={onSearch} />
      </div>
      <div className="col-md-8 text-end">
        <button
          className="btn btn-sm btn-secondary me-1"
          onClick={onFontIncrease}
        >
          A+
        </button>
        <button
          className="btn btn-sm btn-secondary me-3"
          onClick={onFontDecrease}
        >
          A-
        </button>
        <button className="btn btn-outline-success me-1" onClick={onRead}>
          قراءة بصوت
        </button>
        <button className="btn btn-outline-primary" onClick={onBookmark}>
          حفظ الموضع
        </button>
      </div>
    </div>
  );
}
