"use client";
import { usePathname, useRouter } from "next/navigation";
import { House, Tags, Users, Wallet } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", Icon: House }, { href: "/finance", label: "Finance", Icon: Wallet },
  { href: "/kategori", label: "Kategori", Icon: Tags }, { href: "/iuran", label: "Iuran", Icon: Users }
];

export function Nav() {
  const path = usePathname(), router = useRouter();
  return (
    <nav className="nav" aria-label="Navigasi utama">
      {tabs.map(({ href, label, Icon }, i) => (
        <span key={href} style={{ display: "contents" }}>
          {i === 2 && <span />}
          <button className={path === href ? "on" : ""} onClick={() => router.push(href)}><Icon /><span>{label}</span></button>
        </span>
      ))}
    </nav>
  );
}
