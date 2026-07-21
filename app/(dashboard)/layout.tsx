"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Navbar } from "@/components/layout/navbar/navbar";
import styles from "./dashboardLayout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.pulseText}>Cargando plataforma...</div>
      </div>
    );
  }

  return (
    <div className={styles.layoutWrapper}>
      {/* En mobile/tablet es un drawer deslizable; en desktop, panel fijo */}
      <div className={styles.sidebarWrapper}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Fondo oscuro para cerrar el drawer al tocar afuera (solo mobile) */}
      {isSidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={styles.mainContentWrapper}>
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={styles.scrollArea}>
          <div className={styles.innerContainer}>{children}</div>
        </main>
      </div>
    </div>
  );
}
