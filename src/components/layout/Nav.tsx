"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { House, Plus, Tags, Users, Wallet } from "lucide-react";
import type { Category } from "@/domain/finance";
import { TransactionSheet } from "@/components/finance/TransactionSheet";

const LEFT_TABS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/finance", label: "Finance", Icon: Wallet },
];

const RIGHT_TABS = [
  { href: "/kategori", label: "Kategori", Icon: Tags },
  { href: "/iuran", label: "Iuran", Icon: Users },
];

export function Nav({ categories }: { categories: Category[] }) {
  const path = usePathname();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const renderTab = ({ href, label, Icon }: (typeof LEFT_TABS)[number]) => (
    <button key={href} className={path === href ? "on" : ""} onClick={() => router.push(href)}>
      <Icon />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <nav className="nav" aria-label="Navigasi utama">
        {LEFT_TABS.map(renderTab)}
        <button className="fab" aria-label="Tambah transaksi" onClick={() => setAdding(true)}>
          <Plus />
        </button>
        {RIGHT_TABS.map(renderTab)}
      </nav>

      {adding && (
        <TransactionSheet
          categories={categories}
          onClose={() => setAdding(false)}
          onDone={() => setAdding(false)}
        />
      )}
    </>
  );
}