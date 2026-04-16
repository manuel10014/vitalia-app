"use client";

import { useState } from "react";
import UsersTable from "@/components/admin/users/usersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users as UsersIcon, Filter } from "lucide-react";
import styles from "./users.module.css";
import { UserFormSheet } from "@/components/admin/users/usersFormSheets";

export default function UsersPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={styles.container}>
      {/* Header de la Página */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconBox}>
            <UsersIcon size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className={styles.title}>Gestión de Usuarios</h1>
            <p className={styles.subtitle}>
              Administra los accesos, roles y permisos de tu tripulación
              técnica.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsSheetOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-md gap-2"
        >
          <UserPlus size={18} />
          Nuevo Usuario
        </Button>
      </header>

      {/* Barra de Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <Input
            placeholder="Buscar por nombre o email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 text-slate-600">
          <Filter size={16} />
          Filtros
        </Button>
      </div>

      {/* Contenedor de la Tabla */}
      <main className={styles.tableCard}>
        <UsersTable searchTerm={searchTerm} />
      </main>

      <UserFormSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
