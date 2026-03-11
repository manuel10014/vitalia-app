"use client";

import styles from "./skeleton.module.css";

export function AssetFormSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      {/* Campo Superior (Nombre del Activo) */}
      <div className={styles.fieldGroup}>
        <div className={styles.label} />
        <div className={styles.input} />
      </div>

      {/* Grid de Especificaciones Técnicas */}
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.fieldGroup}>
            <div
              className={`${styles.label} ${styles.labelShort}`}
              style={{ width: "6rem" }}
            />
            <div className={styles.input} />
          </div>
        ))}
      </div>

      {/* Footer de Acciones */}
      <div className={styles.footer}>
        <div className={styles.button} />
      </div>
    </div>
  );
}
