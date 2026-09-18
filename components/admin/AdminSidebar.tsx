"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

type AdminSidebarProps = { name: string; roleLabel: string };

function LayoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

const NAV = [{ group: "Site", items: [{ href: "/admin/landing-page", label: "Landing Page", icon: <LayoutIcon /> }] }];

export function AdminSidebar({ name, roleLabel }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="adm-sidebar">
      <a className="adm-sidebar-brand" href="/admin/landing-page">
        FECAP Cases <span>Admin</span>
      </a>

      <nav aria-label="Menu administrativo">
        {NAV.map((group) => (
          <div key={group.group}>
            <p>{group.group}</p>
            {group.items.map((item) => (
              <a href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} key={item.href}>
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-sidebar-user">
        <strong>{name}</strong>
        <span>{roleLabel}</span>
        <form action={signOut}>
          <button type="submit" className="adm-btn adm-btn-small">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
