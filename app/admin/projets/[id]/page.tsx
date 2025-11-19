"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Building,
  HandHeart,
  BookOpen,
  Heart,
  Gift,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  X,
  Users,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ProjectService, type Project } from "@/src/services/project.service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.getProjectById(projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du projet");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

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
      planning: { label: "En planification", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "En cours", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      completed: { label: "Terminé", variant: "outline" as const, color: "bg-green-100 text-green-800" },
      paused: { label: "En pause", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStepStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStepStatusColor = (status: string) => {
    const colors = {
      pending: "text-gray-500 bg-gray-100",
      in_progress: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number): number => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? "Erreur" : "Projet non trouvé"}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || "Le projet demandé n'existe pas ou vous n'y avez pas accès."}
            </p>
            <Button onClick={() => router.push("/admin/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(project.category);
  const progress = calculateProgress(project.current_amount, project.goal_amount);

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-1">Détails du projet</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/projets/${projectId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte des informations principales */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <CategoryIcon className="h-8 w-8 text-blue-600" />
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    <CategoryIcon className="h-4 w-4 mr-1" />
                    {getCategoryLabel(project.category)}
                  </span>
                  {getStatusBadge(project.status)}
                  {project.is_featured && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      Projet phare
                    </Badge>
                  )}
                  <Badge variant={project.is_published ? "default" : "secondary"}>
                    {project.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description courte */}
              {project.short_description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description courte</h3>
                  <p className="text-gray-700 leading-relaxed">{project.short_description}</p>
                </div>
              )}

              {/* Description complète */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description complète</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Image du projet */}
              {project.image_url && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Image du projet</h3>
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Points d'impact */}
              {project.impact_points && project.impact_points.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Points d'impact</h3>
                  <ul className="space-y-2">
                    {project.impact_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Étapes du projet */}
              {project.steps && project.steps.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Étapes du projet</h3>
                  <div className="space-y-3">
                    {project.steps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${getStepStatusColor(step.status)}`}>
                            {getStepStatusIcon(step.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{step.name}</p>
                            <p className="text-sm text-gray-500">
                              Étape {step.order} • 
                              <span className="capitalize ml-1">
                                {step.status === 'pending' && 'En attente'}
                                {step.status === 'in_progress' && 'En cours'}
                                {step.status === 'completed' && 'Terminé'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exemples de dons */}
              {project.donation_examples && project.donation_examples.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Exemples d'impact des dons</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {project.donation_examples.map((example, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              {formatAmount(example.amount)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{example.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Progression financière */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression financière
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      progress >= 80 ? 'bg-green-500' :
                      progress >= 50 ? 'bg-blue-500' :
                      progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">{formatAmount(project.goal_amount)}</p>
                  <p className="text-gray-600">Objectif</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">{formatAmount(project.current_amount)}</p>
                  <p className="text-gray-600">Collecté</p>
                </div>
              </div>

              {project.goal_amount > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Il reste {formatAmount(project.goal_amount - project.current_amount)} à collecter
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations du projet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Informations du projet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                {getStatusBadge(project.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projet phare</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.is_featured ? 'Oui' : 'Non'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Publication</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ordre d'affichage</span>
                <span className="font-medium">{project.order}</span>
              </div>

              {project.steps && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Étapes définies</span>
                  <span className="font-medium">{project.steps.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Créé le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(project.createdAt), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {project.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Modifié le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(project.updatedAt), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {project.published_at && project.is_published && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Publié le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(project.published_at), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {project.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date de début</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(project.start_date), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {project.estimated_end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date de fin estimée</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(project.estimated_end_date), "PPP", { locale: fr })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/admin/projets/${projectId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier le projet
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/projets">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Link>
              </Button>

              {/* Vous pouvez ajouter un bouton de suppression ici */}
              {/* <Button variant="destructive" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Supprimer le projet
              </Button> */}
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points d'impact</span>
                <span className="font-semibold">{project.impact_points?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Exemples de dons</span>
                <span className="font-semibold">{project.donation_examples?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tags</span>
                <span className="font-semibold">{project.tags?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux de progression</span>
                <span className="font-semibold">{progress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Composant Skeleton pour le chargement
function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Skeleton Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-7 w-3/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-28 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skeleton Colonne latérale */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}