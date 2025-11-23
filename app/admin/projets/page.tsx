"use client";

import { useState, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Building,
  HandHeart,
  BookOpen,
  Heart,
  Gift,
  Eye,
  Edit,
  Search,
  Filter,
  X,
  TrendingUp,
  Calendar,
  Target,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ProjectService, type Project } from "@/src/services/project.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  // Charger les projets
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectService.getAllProjects();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des projets");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = projects;

    // Filtre de recherche
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      result = result.filter((project) => project.category === categoryFilter);
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter);
    }

    // Filtre par statut de publication
    if (publishedFilter !== "all") {
      const isPublished = publishedFilter === "published";
      result = result.filter((project) => project.is_published === isPublished);
    }

    setFilteredProjects(result);
  }, [projects, searchTerm, categoryFilter, statusFilter, publishedFilter]);

  // Récupérer les catégories uniques pour le filtre
  const uniqueCategories = [...new Set(projects.map((p) => p.category))];
  const uniqueStatuses = [...new Set(projects.map((p) => p.status))];

  const getCategoryIcon = (category: string) => {
    const icons = {
      construction: Building,
      humanitarian: HandHeart,
      education: BookOpen,
      health: Heart,
      spiritual: Gift,
      other: Building
    };
    return icons[category as keyof typeof icons] || Building;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      construction: "Construction",
      humanitarian: "Humanitaire",
      education: "Éducation",
      health: "Santé",
      spiritual: "Spirituel",
      other: "Autre"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { label: "En planification", variant: "secondary" as const },
      in_progress: { label: "En cours", variant: "default" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      paused: { label: "En pause", variant: "secondary" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPublishedFilter("all");
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || statusFilter !== "all" || publishedFilter !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={loadProjects}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-2">
            {filteredProjects.length} projet
            {filteredProjects.length !== 1 ? "s" : ""} trouvé
            {filteredProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/projets/stats">
              Statistiques
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/projets/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Link>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Barre de recherche */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par catégorie */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      {React.createElement(getCategoryIcon(category), { className: "h-4 w-4" })}
                      {getCategoryLabel(category)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusBadge(status).props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par publication */}
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton reset filtres */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project._id} 
            project={project} 
            onDelete={loadProjects}
            getCategoryIcon={getCategoryIcon}
            getCategoryLabel={getCategoryLabel}
            getStatusBadge={getStatusBadge}
            getProgressColor={getProgressColor}
            formatAmount={formatAmount}
          />
        ))}
      </div>

      {/* État vide */}
      {filteredProjects.length === 0 && projects.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Aucun projet ne correspond à vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun projet pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier projet
            </p>
            <Button asChild>
              <Link href="/admin/projets/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer un projet
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant ProjectCard séparé
interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
  getCategoryIcon: (category: string) => any;
  getCategoryLabel: (category: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  getProgressColor: (progress: number) => string;
  formatAmount: (amount: number) => string;
}

function ProjectCard({ 
  project, 
  onDelete, 
  getCategoryIcon, 
  getCategoryLabel, 
  getStatusBadge, 
  getProgressColor, 
  formatAmount 
}: ProjectCardProps) {
  const CategoryIcon = getCategoryIcon(project.category);

  return (
    <Card key={project._id} className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <CategoryIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {project.title}
                </h3>
                {project.short_description && (
                  <p className="text-gray-600 mt-1 line-clamp-2">{project.short_description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {getCategoryLabel(project.category)}
                  </span>
                  {getStatusBadge(project.status)}
                  {project.is_featured && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Projet phare
                    </Badge>
                  )}
                  <Badge variant={project.is_published ? "default" : "outline"}>
                    {project.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/projets/${project._id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/projets/${project._id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Link>
                </Button>
                {/* Vous pouvez ajouter un composant DeleteProjectButton similaire à vos autres composants de suppression */}
              </div>
            </div>

            {/* Métriques financières */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Objectif</p>
                  <p className="text-gray-600">{formatAmount(project.goal_amount)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Collecté</p>
                  <p className="text-gray-600">{formatAmount(project.current_amount)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Progression</p>
                  <p className="text-gray-600">{project.progress}%</p>
                </div>
              </div>
              
              {project.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Créé le</p>
                    <p className="text-gray-600 text-xs">
                      {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Barre de progression */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progression de la collecte</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Étapes du projet */}
            {project.steps && project.steps.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-900 mb-2">Étapes du projet</p>
                <div className="flex flex-wrap gap-2">
                  {project.steps.slice(0, 3).map((step, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className={`text-xs ${
                        step.status === 'completed' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : step.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {step.name}
                    </Badge>
                  ))}
                  {project.steps.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.steps.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.tags.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Import React pour JSX
import React from "react";