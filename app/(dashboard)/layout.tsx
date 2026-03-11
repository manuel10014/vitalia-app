"use client";

import { useEffect } from "react";
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
      {/* Sidebar encapsulado para escritorio */}
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>

      <div className={styles.mainContentWrapper}>
        <Navbar />
        <main className={styles.scrollArea}>
          <div className={styles.innerContainer}>{children}</div>
        </main>
      </div>
    </div>
  );
}
