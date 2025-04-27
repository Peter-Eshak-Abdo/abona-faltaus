"use client";

import { useState } from "react";

const lahnat = ["تين ثينو", "ابشويس", "وسيموتي", "جولي ناي نان", "افلوجي"];

export default function SearchBar() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 0) {
      setSuggestions(lahnat.filter(lahn => lahn.toLowerCase().includes(value.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (value: string) => {
    setInput(value);
    setSuggestions([]);
  };

  return (
    <>
      <input
        className="form-control mb-3"
        value={input}
        onChange={handleChange}
        placeholder="ابحث عن لحن..."
      />
      <ul className="list-group">
        {suggestions.map((lahn, idx) => (
          <li
            key={idx}
            className="list-group-item list-group-item-action"
            onClick={() => handleSelect(lahn)}
            style={{ cursor: 'pointer' }}
          >
            {lahn}
          </li>
        ))}
      </ul>
    </>
  );
}
