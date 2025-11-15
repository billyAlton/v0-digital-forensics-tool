"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  FileText,
  Music,
  HelpCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ResourceService, type Resource } from "@/src/services/resource.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Charger les ressources
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await ResourceService.getAllResources();
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des ressources");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = resources;

    // Filtre de recherche
    if (searchTerm) {
      result = result.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.tags?.some(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      result = result.filter((resource) => resource.category === categoryFilter);
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      result = result.filter((resource) => resource.is_published === isPublished);
    }

    setFilteredResources(result);
  }, [resources, searchTerm, categoryFilter, statusFilter]);

  // Récupérer les catégories uniques pour le filtre
  const uniqueCategories = [...new Set(resources.map((r) => r.category))];

  const getCategoryIcon = (category: string) => {
    const icons = {
      book: BookOpen,
      brochure: FileText,
      song: Music,
      faq: HelpCircle,
      other: FileText
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      book: "Livre",
      brochure: "Brochure",
      song: "Chant",
      faq: "FAQ",
      other: "Autre"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getFileTypeLabel = (fileType: string) => {
    const labels = {
      pdf: "PDF",
      audio: "Audio",
      video: "Vidéo",
      text: "Texte",
      image: "Image",
      none: "Aucun"
    };
    return labels[fileType as keyof typeof labels] || fileType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={loadResources}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ressources</h1>
          <p className="text-gray-600 mt-2">
            {filteredResources.length} ressource
            {filteredResources.length !== 1 ? "s" : ""} trouvé
            {filteredResources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/resources/stats">
              Statistiques
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/resources/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une ressource
            </Link>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
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
                    {getCategoryLabel(category)}
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
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton reset filtres */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              disabled={
                !searchTerm && categoryFilter === "all" && statusFilter === "all"
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ressources */}
      <div className="grid gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard 
            key={resource._id} 
            resource={resource} 
            onDelete={loadResources}
            getCategoryIcon={getCategoryIcon}
            getCategoryLabel={getCategoryLabel}
            getFileTypeLabel={getFileTypeLabel}
          />
        ))}
      </div>

      {/* État vide */}
      {filteredResources.length === 0 && resources.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune ressource trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune ressource ne correspond à vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {resources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune ressource pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre première ressource
            </p>
            <Button asChild>
              <Link href="/admin/resources/new">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ressource
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant ResourceCard séparé
interface ResourceCardProps {
  resource: Resource;
  onDelete: () => void;
  getCategoryIcon: (category: string) => any;
  getCategoryLabel: (category: string) => string;
  getFileTypeLabel: (fileType: string) => string;
}

function ResourceCard({ resource, onDelete, getCategoryIcon, getCategoryLabel, getFileTypeLabel }: ResourceCardProps) {
  const CategoryIcon = getCategoryIcon(resource.category);

  const handleDownload = async () => {
    try {
      await ResourceService.incrementDownloadCount(resource._id!);
      // Ouvrir le fichier dans un nouvel onglet
      if (resource.file_url) {
        window.open(resource.file_url, '_blank');
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  return (
    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
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
                  {resource.title}
                </h3>
                <p className="text-gray-600 mt-1">{resource.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(resource.category)}
                  </Badge>
                  <Badge variant={resource.is_published ? "default" : "outline"}>
                    {resource.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  {resource.file_type !== "none" && (
                    <Badge variant="outline">
                      {getFileTypeLabel(resource.file_type)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/resources/${resource._id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/resources/${resource._id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Link>
                </Button>
                {/* Vous pouvez ajouter un composant DeleteResourceButton similaire à DeleteSermonButton */}
              </div>
            </div>

            {/* Métadonnées */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              {resource.pages && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pages:</span>
                  {resource.pages}
                </div>
              )}
              {resource.duration && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Durée:</span>
                  {resource.duration}
                </div>
              )}
              {resource.artist && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Artiste:</span>
                  {resource.artist}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{resource.download_count} téléchargements</span>
              </div>
              {resource.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Créé:</span>
                  {format(new Date(resource.createdAt), "dd/MM/yyyy", { locale: fr })}
                </div>
              )}
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {resource.file_url && resource.file_type !== "none" && (
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              )}
              {resource.file_size && resource.file_type !== "none" && (
                <span className="text-sm text-gray-500 self-center">
                  ({Math.round(resource.file_size / 1024 / 1024 * 100) / 100} MB)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}