"use client";

import { useState, useMemo } from "react";
import { useAssets } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Asset } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./assets.module.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Package,
  QrCode,
  Settings2,
  FilterX,
} from "lucide-react";
import { AssetFormSheet } from "@/components/admin/Assets/AssetFormSheet";

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: response, isLoading } = useAssets();

  const filteredAssets = useMemo(() => {
    const allAssets: Asset[] = response?.data || [];

    let filtered = allAssets;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (!searchTerm) return filtered;

    const lowerSearch = searchTerm.toLowerCase();

    return filtered.filter((a) => {
      return (
        a.name?.toLowerCase().includes(lowerSearch) ||
        a.tagId?.toLowerCase().includes(lowerSearch) ||
        a.category?.name?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [response, searchTerm, statusFilter]);

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedAsset(null);
    setIsSheetOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.categoryLabel}>
            <Package className="w-4 h-4" />
            <span>Inventario</span>
          </div>
          <h1 className={styles.title}>Activos Técnicos</h1>
          <p className={styles.subtitle}>
            Control de hojas de vida, especificaciones dinámicas y trazabilidad
            por QR.
          </p>
        </div>

        <div className={styles.actionsBar}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="OPERATIONAL">Operativo</SelectItem>
              <SelectItem value="MAINTENANCE">En Mantenimiento</SelectItem>
              <SelectItem value="DOWN">Fuera de Servicio</SelectItem>
            </SelectContent>
          </Select>

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Tag ID, Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInputCustom}
            />
          </div>

          <Button onClick={handleCreate} className={styles.createButton}>
            <Plus className="w-4 h-4" /> Nuevo Activo
          </Button>
        </div>
      </header>

      <div className={styles.tableCard}>
        <DataTable<Asset>
          data={filteredAssets}
          isLoading={isLoading}
          onEdit={handleEdit}
          columns={[
            {
              header: "Identificación / Tag",
              render: (a) => (
                <div className={styles.assetCell}>
                  <div className={styles.qrIconBox}>
                    <QrCode className={styles.iconStandard} />
                  </div>
                  <div className={styles.flexColumn}>
                    <span className={styles.assetMainName}>{a.name}</span>
                    <div className={styles.tagGroup}>
                      <span className={styles.tagName}>{a.tagId}</span>
                      <span className={styles.categorySub}>
                        • {a.category?.name || "N/A"}
                      </span>{" "}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Ubicación / Proyecto",
              render: (a) => (
                <div className={styles.locationCell}>
                  <span className={styles.projectName}>
                    {a.project?.name || "Proyecto no asignado"}
                  </span>
                  <span className={styles.locationSub}>
                    <span className={styles.locationDot} />
                    {a.locationDescription || "Sin ubicación"}
                  </span>
                </div>
              ),
            },
            {
              header: "Especificaciones",
              render: (a) => {
                const specsEntries = Object.entries(a.specs || {});
                if (specsEntries.length === 0)
                  return <span className={styles.emptySpecs}>N/A</span>;

                return (
                  <div className={styles.specsContainer}>
                    {specsEntries.slice(0, 3).map(([key, value]) => (
                      <div key={key} className={styles.specRow}>
                        <span className={styles.specKey}>{key}</span>
                        <span className={styles.specValue}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                    {specsEntries.length > 3 && (
                      <div className={styles.moreSpecs}>
                        <Settings2 className={styles.moreSpecsIcon} />
                        <span className={styles.moreSpecsText}>
                          +{specsEntries.length - 3} parámetros
                        </span>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              header: "Estado Operativo",
              render: (a: Asset) => {
                const statusClass =
                  a.status === "OPERATIONAL"
                    ? styles.statusOperational
                    : styles.statusMaintenance;

                return (
                  <div className={styles.statusContainer}>
                    <Badge
                      variant="outline"
                      className={`${styles.badgeBase} ${statusClass}`}
                    >
                      {a.status}
                    </Badge>
                    <span className={styles.updateDate}>
                      Actualizado: {new Date(a.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              },
            },
          ]}
        />

        {filteredAssets.length === 0 && !isLoading && (
          <div className={styles.emptyState}>
            <FilterX className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>No se encontraron activos</p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      <AssetFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        asset={selectedAsset}
      />
    </div>
  );
}
