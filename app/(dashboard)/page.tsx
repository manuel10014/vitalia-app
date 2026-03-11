"use client";

import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Resumen del Sistema</h1>
        <p className={styles.subtitle}>Bienvenido al panel de Vitalia.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Órdenes Activas</p>
          <p className={styles.statValue}>12</p>
        </div>

        {/* Placeholder para más métricas */}
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Protocolos en Diseño</p>
          <p className={styles.statValue}>5</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Ejecuciones hoy</p>
          <p className={styles.statValue}>8</p>
        </div>
      </div>
    </div>
  );
}
