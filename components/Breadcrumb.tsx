"use client";
import Link from "next/link";

export default function Breadcrumb({ paths }: { paths: { href: string; label: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="p-2">
      <ol className="breadcrumb">
        {paths.map((path, index) => (
          <li key={index} className={`breadcrumb-item ${index === paths.length - 1 ? 'active' : ''}`}>
            {index !== paths.length - 1 ? (
              <Link href={path.href}>{path.label}</Link>
            ) : (
              path.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
