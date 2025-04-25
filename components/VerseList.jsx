'use client'
export default function VerseList({ data, fontSize }) {
  return (
    <div id="verses" className="border rounded p-3" style={{ minHeight: 300 }}>
      {data.map((v, i) => (
        <p
          key={i}
          style={{ fontSize }}
          onClick={() => navigator.clipboard.writeText(v.ref ? `${v.ref} - ${v.text}` : v.text)}
        >
          {v.idx == null
            ? <><strong>{v.ref}</strong> - {v.text}</>
            : <><span className="verse-num">{v.idx + 1}</span> {v.text}</>
          }
        </p>
      ))}
    </div>
  );
}
