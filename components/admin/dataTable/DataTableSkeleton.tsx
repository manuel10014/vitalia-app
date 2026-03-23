// components/admin/dataTable/DataTableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./dataTable.module.css";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 8,
}: DataTableSkeletonProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className={styles.th}>
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={rowIndex} className={styles.tr}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <td key={colIndex} className={styles.td}>
                  <Skeleton className="h-5 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
