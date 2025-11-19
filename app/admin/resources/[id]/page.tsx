"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  FileText, 
  BookOpen, 
  Music, 
  HelpCircle, 
  Edit,
  Eye,
  User,
  Clock,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ResourceService, type Resource } from "@/src/services/resource.service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Composants réutilisables
function CategoryIcon({ category, className = "h-6 w-6" }: { category: string; className?: string }) {
  const icons = {
    book: BookOpen,
    brochure: FileText,
    song: Music,
    faq: HelpCircle,
    other: FileText
  };
  const IconComponent = icons[category as keyof typeof icons] || FileText;
  return <IconComponent className={className} />;
}

function CategoryBadge({ category }: { category: string }) {
  const categories = {
    book: { label: "Livre", color: "bg-blue-100 text-blue-800" },
    brochure: { label: "Brochure", color: "bg-green-100 text-green-800" },
    song: { label: "Chant", color: "bg-purple-100 text-purple-800" },
    faq: { label: "FAQ", color: "bg-orange-100 text-orange-800" },
    other: { label: "Autre", color: "bg-gray-100 text-gray-800" }
  };

  const categoryConfig = categories[category as keyof typeof categories] || categories.other;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
      <CategoryIcon category={category} className="h-3 w-3 mr-1" />
      {categoryConfig.label}
    </span>
  );
}

function FileTypeBadge({ fileType }: { fileType: string }) {
  const types = {
    pdf: { label: "PDF", color: "bg-red-100 text-red-800" },
    audio: { label: "Audio", color: "bg-yellow-100 text-yellow-800" },
    video: { label: "Vidéo", color: "bg-indigo-100 text-indigo-800" },
    text: { label: "Texte", color: "bg-gray-100 text-gray-800" },
    image: { label: "Image", color: "bg-pink-100 text-pink-800" },
    none: { label: "Aucun fichier", color: "bg-gray-100 text-gray-800" }
  };

  const typeConfig = types[fileType as keyof typeof types] || types.none;

  return (
    <Badge variant="outline" className={typeConfig.color}>
      {typeConfig.label}
    </Badge>
  );
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const resourceId = params.id as string;

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const data = await ResourceService.getResourceById(resourceId);
        setResource(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la ressource");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const handleDownload = async () => {
    if (!resource?.file_url) return;

    try {
      setDownloading(true);
      // Incrémenter le compteur de téléchargements
      await ResourceService.incrementDownloadCount(resourceId);
      
      // Ouvrir le fichier dans un nouvel onglet
      window.open(resource.file_url, '_blank');
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      // Ouvrir quand même le fichier même si l'incrémentation échoue
      window.open(resource.file_url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Inconnu";
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return <ResourceDetailSkeleton />;
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? "Erreur" : "Ressource non trouvée"}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || "La ressource demandée n'existe pas ou vous n'y avez pas accès."}
            </p>
            <Button onClick={() => router.push("/admin/resources")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux ressources
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/resources")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>
            <p className="text-gray-600 mt-1">Détails de la ressource</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/resources/${resourceId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          {resource.file_url && resource.file_type !== "none" && (
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Téléchargement..." : "Télécharger"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte des informations principales */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <CategoryIcon category={resource.category} className="h-8 w-8 text-blue-600" />
                  {resource.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={resource.category} />
                  <Badge variant={resource.is_published ? "default" : "secondary"}>
                    {resource.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  <FileTypeBadge fileType={resource.file_type} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{resource.description}</p>
              </div>

              {/* Fichier */}
              {resource.file_url && resource.file_type !== "none" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fichier</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Fichier attaché</p>
                        <p className="text-sm text-gray-500">
                          {resource.file_size && `${formatFileSize(resource.file_size)} • `}
                          {resource.file_type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleDownload} disabled={downloading}>
                      <Download className="mr-2 h-4 w-4" />
                      {downloading ? "..." : "Ouvrir"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
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
          {/* Informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Informations techniques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Téléchargements</span>
                <span className="font-medium flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {resource.download_count}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ordre d'affichage</span>
                <span className="font-medium">{resource.order}</span>
              </div>

              {resource.pages && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nombre de pages</span>
                  <span className="font-medium">{resource.pages}</span>
                </div>
              )}

              {resource.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durée</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {resource.duration}
                  </span>
                </div>
              )}

              {resource.artist && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Artiste/Prédicateur</span>
                  <span className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {resource.artist}
                  </span>
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
              {resource.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Créé le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(resource.createdAt), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {resource.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Modifié le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(resource.updatedAt), "PPP", { locale: fr })}
                  </span>
                </div>
              )}

              {resource.published_at && resource.is_published && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Publié le</span>
                  <span className="font-medium text-sm text-right">
                    {format(new Date(resource.published_at), "PPP", { locale: fr })}
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
                <Link href={`/admin/resources/${resourceId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier la ressource
                </Link>
              </Button>
              
              {resource.file_url && resource.file_type !== "none" && (
                <Button variant="outline" onClick={handleDownload} disabled={downloading} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? "Téléchargement..." : "Télécharger le fichier"}
                </Button>
              )}

              <Button variant="outline" onClick={() => router.push("/admin/resources")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Composant Skeleton pour le chargement
function ResourceDetailSkeleton() {
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
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
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
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
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
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}