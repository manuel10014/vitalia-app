"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Lock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePermissionsMatrix,
  useUpdateRolePermissions,
} from "@/hooks/useRoles";
import styles from "./PermissionsMatrix.module.css";

/** roleId -> resource -> nuevo valor (solo lo que el usuario cambió, sin guardar aún) */
type PendingChanges = Record<string, Record<string, boolean>>;

export function PermissionsMatrix() {
  const { data: matrix, isLoading } = usePermissionsMatrix();
  const updateMutation = useUpdateRolePermissions();
  const [pending, setPending] = useState<PendingChanges>({});

  const pendingCount = useMemo(
    () => Object.values(pending).reduce((sum, r) => sum + Object.keys(r).length, 0),
    [pending],
  );

  // Catálogo de recursos (filas) tomado del primer rol — todos comparten
  // el mismo catálogo fijo, así que cualquiera sirve de referencia.
  const resources = matrix?.[0]?.permissions ?? [];

  const toggle = (roleId: string, resource: string, current: boolean) => {
    setPending((prev) => {
      const roleChanges = { ...(prev[roleId] || {}) };
      roleChanges[resource] = !current;
      return { ...prev, [roleId]: roleChanges };
    });
  };

  const effectiveValue = (roleId: string, resource: string, serverValue: boolean) =>
    pending[roleId]?.[resource] ?? serverValue;

  const handleSave = async () => {
    const roleIds = Object.keys(pending);
    for (const roleId of roleIds) {
      const changes = pending[roleId];
      const permissions = Object.entries(changes).map(([resource, allowed]) => ({
        resource,
        allowed,
      }));
      if (permissions.length === 0) continue;
      // eslint-disable-next-line no-await-in-loop
      await updateMutation.mutateAsync({ roleId, permissions });
    }
    setPending({});
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIconBox}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className={styles.title}>Matriz de Acceso por Módulo</div>
              <div className={styles.subtitle}>Cargando permisos...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!matrix || matrix.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIconBox}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className={styles.title}>Matriz de Acceso por Módulo</div>
            <div className={styles.subtitle}>
              Qué áreas de Vitalia puede usar cada rol. SUPERADMIN siempre
              tiene acceso total y no es editable.
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={pendingCount === 0 || updateMutation.isPending}
          className={styles.saveButton}
        >
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <Save size={15} />
          )}
          Guardar Cambios
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>{pendingCount}</span>
          )}
        </Button>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.resourceHeaderCell}>Módulo</th>
              {matrix.map((role) => (
                <th key={role.roleId} className={styles.roleHeaderCell}>
                  <span className={styles.roleHeaderName}>{role.roleName}</span>
                  <span className={styles.roleHeaderKey}>{role.roleKey}</span>
                  {role.permissions[0]?.locked && (
                    <span className={styles.roleHeaderLockedBadge}>
                      <Lock size={9} /> Acceso total
                    </span>
                  )}
                  {role.isSystem && !role.permissions[0]?.locked && (
                    <span className={styles.roleHeaderLockedBadge}>
                      <Lock size={9} /> Sistema
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res.resource} className={styles.row}>
                <td className={styles.resourceCell}>{res.label}</td>
                {matrix.map((role) => {
                  const serverEntry = role.permissions.find(
                    (p) => p.resource === res.resource,
                  );
                  const serverValue = serverEntry?.allowed ?? false;
                  const isLocked = serverEntry?.locked || role.isSystem;
                  const checked = effectiveValue(
                    role.roleId,
                    res.resource,
                    serverValue,
                  );
                  const isDirty =
                    pending[role.roleId]?.[res.resource] !== undefined;

                  return (
                    <td
                      key={role.roleId}
                      className={`${styles.checkboxCell} ${
                        isDirty ? styles.checkboxCellDirty : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isLocked}
                        aria-label={`${res.label} - ${role.roleName}`}
                        onChange={() =>
                          toggle(role.roleId, res.resource, checked)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.footerNote}>
        Estos permisos se suman a los permisos base del sistema — nunca los
        reemplazan. Desmarcar un módulo aquí le quita el acceso a ese rol
        aunque su nivel base normalmente lo permitiera.
      </p>
    </div>
  );
}
