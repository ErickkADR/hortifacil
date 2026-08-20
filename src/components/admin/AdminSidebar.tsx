"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, ShoppingCart, Package, LogOut, Leaf } from "lucide-react";
import { logout } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/montar-pedido", label: "Montar pedido", icon: ShoppingCart },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-border bg-surface py-6">
      <div className="mb-8 flex items-center gap-2 px-6">
        <Leaf className="h-5 w-5 text-leaf" strokeWidth={2} />
        <span className="font-display text-lg text-ink">
          Horti<span className="font-medium text-leaf">Fácil</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-leaf text-white"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <form action={logout} className="px-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          Sair
        </button>
      </form>
    </nav>
  );
}
