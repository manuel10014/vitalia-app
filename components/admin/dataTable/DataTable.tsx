"use client";

import { ReactNode } from "react";
import { MoreHorizontal, Edit, Power, PowerOff, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTableSkeleton } from "./DataTableSkeleton";
import styles from "./dataTable.module.css";

interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onEdit?: (item: T) => void;
  onToggleStatus?: (item: T) => void;
  emptyMessage?: string; // Prop opcional para mensajes personalizados
}

export function DataTable<T extends { id: string; isActive?: boolean }>({
  data,
  columns,
  isLoading,
  onEdit,
  onToggleStatus,
  emptyMessage = "No se encontraron registros en esta sección.",
}: DataTableProps<T>) {
  // 1. Estado de Carga centralizado
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length + (onEdit || onToggleStatus ? 1 : 0)}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={styles.th}>
                {col.header}
              </th>
            ))}
            {(onEdit || onToggleStatus) && (
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {/* 2. Manejo de Estado Vacío */}
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className={styles.emptyState}>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox
                    size={40}
                    strokeWidth={1}
                    className="mb-4 opacity-20"
                  />
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className={styles.tr}>
                {columns.map((col, i) => (
                  <td key={i} className={styles.td}>
                    {col.render(item)}
                  </td>
                ))}

                {(onEdit || onToggleStatus) && (
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`${styles.actionButton} h-8 w-8 p-0`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Operaciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            className="cursor-pointer"
                          >
                            <Edit
                              className={`mr-2 h-4 w-4 ${styles.textBlue}`}
                            />
                            Editar Datos
                          </DropdownMenuItem>
                        )}

                        {onToggleStatus && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(item)}
                            className={`cursor-pointer ${styles.bgRedHover}`}
                          >
                            {item.isActive ? (
                              <>
                                <PowerOff
                                  className={`mr-2 h-4 w-4 ${styles.textRed}`}
                                />
                                <span className={styles.textRed}>
                                  Deshabilitar
                                </span>
                              </>
                            ) : (
                              <>
                                <Power
                                  className={`mr-2 h-4 w-4 ${styles.textGreen}`}
                                />
                                <span className={styles.textGreen}>
                                  Habilitar
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
