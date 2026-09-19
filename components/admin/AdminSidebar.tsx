"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

type AdminSidebarProps = { name: string; roleLabel: string };

type NavItem = { href: string; label: string; icon: React.ReactNode; isActive?: (pathname: string) => boolean };

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const BLOG_SECTIONS = ["/admin/blog/categories", "/admin/blog/tags", "/admin/blog/media"];

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Site",
    items: [
      {
        href: "/admin/landing-page",
        label: "Landing Page",
        icon: (
          <Icon>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </Icon>
        ),
      },
    ],
  },
  {
    group: "Blog",
    items: [
      {
        href: "/admin/blog",
        label: "Publicações",
        // Lista, nova publicação e edição — mas não as outras seções do Blog.
        isActive: (pathname) => pathname.startsWith("/admin/blog") && !BLOG_SECTIONS.some((section) => pathname.startsWith(section)),
        icon: (
          <Icon>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </Icon>
        ),
      },
      {
        href: "/admin/blog/categories",
        label: "Categorias",
        icon: (
          <Icon>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          </Icon>
        ),
      },
      {
        href: "/admin/blog/tags",
        label: "Tags",
        icon: (
          <Icon>
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
            <circle cx="7.5" cy="7.5" r="1" />
          </Icon>
        ),
      },
      {
        href: "/admin/blog/media",
        label: "Mídia",
        icon: (
          <Icon>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-4.5-4.5L5 21" />
          </Icon>
        ),
      },
    ],
  },
];

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
              <a href={item.href} aria-current={(item.isActive?.(pathname) ?? pathname.startsWith(item.href)) ? "page" : undefined} key={item.href}>
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
