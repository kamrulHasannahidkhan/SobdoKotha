"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/daily", label: "Daily" },
  { href: "/practice", label: "Practice" },
  { href: "/game", label: "Test" },
  { href: "/words", label: "Words" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="masthead">
      <Link href="/" className="brand" lang="bn">
        শব্দ খাতা
        <small lang="en">Shobdo Khata</small>
      </Link>
      <nav className="tabs" aria-label="Main">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
