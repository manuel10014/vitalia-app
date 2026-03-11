"use client";

import { useState } from "react";
import { Plus, Tag, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CategoryFormDialog } from "@/components/admin/categories/categoriesFormDialog";
import { useCategoryAdmin } from "@/hooks/useCategories";

import styles from "./categories.module.css";

const SkeletonLoader = () => (
  <div className={styles.grid}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className={styles.skeletonCard} />
    ))}
  </div>
);

export default function CategoriesPage() {
  const { data, isLoading } = useCategoryAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const categories = data || [];
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>
            <FolderTree className="h-6 w-6 text-primary" /> Gestión de
            Categorías
          </h1>
          <p className={styles.description}>
            Define los tipos de activos para tu organización.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus size={18} /> NUEVA CATEGORÍA
        </Button>
      </header>

      {isLoading ? (
        <SkeletonLoader />
      ) : categories.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className="text-muted-foreground">
            No hay categorías registradas.
          </p>
          <Button
            variant="link"
            onClick={() => setIsDialogOpen(true)}
            className="mt-2"
          >
            Crea la primera categoría ahora
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Card key={cat.id} className={styles.card}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag size={16} className="text-primary" /> {cat.name}
                </CardTitle>
                <CardDescription>
                  {cat.description || "Sin descripción detallada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className={styles.categoryTag}>
                  ID: {cat.id.split("-")[0]}...
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
