"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { ProjectFormSheet } from "@/components/admin/projects/projectFormSheet";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import styles from "./projects.module.css";

export default function ProjectsPage() {
  const { data: response, isLoading } = useProjects();
  const projects = response?.data || [];

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Proyectos Técnicos</h1>
        <Button
          onClick={() => {
            setSelectedProject(null);
            setIsOpen(true);
          }}
        >
          Crear Proyecto
        </Button>
      </header>

      <DataTable<Project>
        data={projects}
        isLoading={isLoading}
        onEdit={(p) => {
          setSelectedProject(p);
          setIsOpen(true);
        }}
        columns={[
          {
            header: "Proyecto",
            render: (p) => (
              <div className={styles.projectCell}>
                <span className={styles.projectName}>{p.name}</span>
                <span className={styles.projectCode}>{p.code || "S/C"}</span>
              </div>
            ),
          },
          {
            header: "Cliente",
            render: (p) => (
              <Badge variant="outline" className={styles.clientBadge}>
                {p.client?.businessName || "Desconocido"}
              </Badge>
            ),
          },
          {
            header: "Estado",
            render: (p) => (
              <Badge
                className={`${styles.statusBadge} ${p.isActive ? styles.statusActive : styles.statusClosed}`}
              >
                {p.isActive ? "Activo" : "Cerrado"}
              </Badge>
            ),
          },
        ]}
      />

      <ProjectFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        project={selectedProject}
      />
    </div>
  );
}
