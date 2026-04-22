"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import {
  LayoutDashboard,
  ClipboardList,
  FlaskConical,
  FileText,
  Users,
  FolderKanban,
  Box,
  Settings,
  ShieldCheck,
  Tags,
  Zap,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/admin/work-orders", label: "Órdenes (OT)", icon: ClipboardList },
  { href: "/admin/test-runs", label: "Ejecuciones", icon: FlaskConical },
  { href: "/admin/reports", label: "Reportes", icon: FileText },
];

const engineeringItems: NavItem[] = [
  { href: "/admin/equipment", label: "Equipos Medición", icon: ShieldCheck },
  { href: "/admin/protocols", label: "Servicios", icon: Zap },
];

const adminItems: NavItem[] = [
  { href: "/admin/clients", label: "Clientes", icon: Users },
  { href: "/admin/assets", label: "Activos", icon: Box },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/users", label: "Usuarios", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
      >
        <item.icon
          className={`${styles.icon} ${isActive ? styles.iconActive : ""}`}
        />
        <span className={styles.truncate}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoBox}>V</div>
          <div>
            <h1 className={styles.brandName}>Vitalia</h1>
            <p className={styles.brandSub}>Ingeniería Eléctrica</p>
          </div>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <nav>
          <p className={styles.sectionTitle}>Estructura</p>
          <div className={styles.navGroup}>
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>

        <nav>
          <p className={styles.sectionTitle}>Ingeniería</p>
          <div className={styles.navGroup}>
            {engineeringItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>

        <nav>
          <p className={styles.sectionTitle}>Operaciones</p>
          <div className={styles.navGroup}>
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
