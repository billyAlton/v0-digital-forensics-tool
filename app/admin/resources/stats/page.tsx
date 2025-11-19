"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, BookOpen, FileText, Music, HelpCircle } from "lucide-react";
import { ResourceService, type ResourceStats } from "@/src/services/resource.service";

export default function ResourceStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await ResourceService.getResourceStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des statistiques");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

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
      book: "Livres",
      brochure: "Brochures",
      song: "Chants",
      faq: "FAQ",
      other: "Autres"
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error || "Impossible de charger les statistiques"}</p>
          <Button onClick={loadStats}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/resources")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques des Ressources</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de l'utilisation des ressources</p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ressources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Ressources créées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Total des téléchargements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressources Publiées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byCategory.reduce((acc, cat) => acc + cat.published, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Visibles publiquement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total - stats.byCategory.reduce((acc, cat) => acc + cat.published, 0)}
            </div>
            <p className="text-xs text-muted-foreground">En attente de publication</p>
          </CardContent>
        </Card>
      </div>

      {/* Détails par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.byCategory.map((category) => {
              const IconComponent = getCategoryIcon(category._id);
              return (
                <Card key={category._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-semibold">{getCategoryLabel(category._id)}</p>
                          <p className="text-sm text-gray-500">
                            {category.published} publié(s) sur {category.count}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Téléchargements:</span>
                        <span className="font-semibold">{category.totalDownloads}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${category.count > 0 ? (category.published / category.count) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}