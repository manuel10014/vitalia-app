"use client";

import styles from "./skeleton.module.css";

export function DataTableSkeleton() {
  return (
    <div className={styles.container}>
      {/* Cabecera de tabla simulada */}
      <div className={styles.header}>
        <div className={styles.titlePlaceholder} />
        <div className={styles.buttonPlaceholder} />
      </div>

      {/* Filas de tabla simuladas */}
      <div className={styles.tableFrame}>
        <div className={styles.tableHead} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.row}>
            <div className={styles.cell} />
            <div className={styles.cell} />
            <div className={styles.cell} />
            <div className={styles.actionCell} />
          </div>
        ))}
      </div>
    </div>
  );
}
