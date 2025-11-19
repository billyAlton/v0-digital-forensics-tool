"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Mail, 
  MapPin, 
  Heart, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TestimonyService, Testimony } from "@/src/services/testimony.service";
import { BASE_URL } from "@/lib/apiCaller";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Import des composants UI supplémentaires
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner"

// Composants réutilisables depuis la page principale
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: "En attente", variant: "secondary" as const },
    approved: { label: "Approuvé", variant: "default" as const },
    scheduled: { label: "Programmé", variant: "outline" as const },
    archived: { label: "Archivé", variant: "secondary" as const },
    rejected: { label: "Rejeté", variant: "destructive" as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const categories = {
    guerison: { label: "Guérison", color: "bg-green-100 text-green-800" },
    famille: { label: "Famille", color: "bg-blue-100 text-blue-800" },
    finances: { label: "Finances", color: "bg-yellow-100 text-yellow-800" },
    delivrance: { label: "Délivrance", color: "bg-purple-100 text-purple-800" },
    miracle: { label: "Miracle", color: "bg-red-100 text-red-800" },
    transformation: { label: "Transformation", color: "bg-indigo-100 text-indigo-800" },
    autre: { label: "Autre", color: "bg-gray-100 text-gray-800" }
  };

  const categoryConfig = categories[category as keyof typeof categories] || categories.autre;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
      {categoryConfig.label}
    </span>
  );
}

export default function TestimonyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [testimony, setTestimony] = useState<Testimony | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const testimonyId = params.id as string;

  useEffect(() => {
    const fetchTestimony = async () => {
      try {
        setLoading(true);
        const data = await TestimonyService.getTestimonyById(testimonyId);
        setTestimony(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du témoignage");
      } finally {
        setLoading(false);
      }
    };

    if (testimonyId) {
      fetchTestimony();
    }
  }, [testimonyId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!testimony) return;

    try {
      setIsUpdating(true);
      const updatedTestimony = await TestimonyService.updateTestimonyStatus(testimonyId, {
        status: newStatus
      });
      
      setTestimony(updatedTestimony);
      
      toast(`Le témoignage a été ${getStatusLabel(newStatus)} avec succès.`);

    } catch (err: any) {
      toast(`Le témoignage a rencontrer une erreur`);

    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUpdating(true);
      await TestimonyService.deleteTestimony(testimonyId);
      
      toast(`Le témoignage a été supprime avec succès.`);

      
      router.push("/admin/testimonies");
    } catch (err: any) {
      toast(`Erreur de suppression`);

    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "mis en attente",
      approved: "approuvé",
      scheduled: "programmé",
      archived: "archivé",
      rejected: "rejeté"
    };
    return labels[status] || status;
  };

  const toggleFeatured = async () => {
    if (!testimony) return;

    try {
      setIsUpdating(true);
      const updatedTestimony = await TestimonyService.updateTestimonyStatus(testimonyId, {
        status: testimony.status,
        is_featured: !testimony.is_featured
      });
      
      setTestimony(updatedTestimony);
      
      toast(`Le témoignage a été mis en avant avec succès.`);

    } catch (err: any) {
      toast(`Erreur de modification.`);

    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <TestimonyDetailSkeleton />;
  }

  if (error || !testimony) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error ? "Erreur" : "Témoignage non trouvé"}
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "Le témoignage demandé n'existe pas."}
        </p>
        <Button onClick={() => router.push("/admin/testimonies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux témoignages
        </Button>
      </div>
    );
  }

  const baseMediaUrl = BASE_URL.replace("/api", "");

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/testimonies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Détail du témoignage</h1>
            <p className="text-gray-600 mt-1">Informations complètes du témoignage</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Menu déroulant pour les actions rapides */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isUpdating}>
                <Edit className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Modifier le statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('approved')}
                disabled={testimony.status === 'approved' || isUpdating}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Approuver
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('pending')}
                disabled={testimony.status === 'pending' || isUpdating}
              >
                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                Mettre en attente
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('rejected')}
                disabled={testimony.status === 'rejected' || isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Rejeter
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('archived')}
                disabled={testimony.status === 'archived' || isUpdating}
              >
                <Archive className="mr-2 h-4 w-4 text-gray-600" />
                Archiver
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={toggleFeatured} disabled={isUpdating}>
                {testimony.is_featured ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Retirer des favoris
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mettre en avant
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton d'édition complète */}
          {/* <Button asChild>
            <Link href={`/admin/testimonies/${testimonyId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button> */}

          {/* Bouton de suppression */}
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isUpdating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte du témoignage */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CardTitle className="text-2xl">{testimony.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={testimony.status} />
                  <CategoryBadge category={testimony.category} />
                  {testimony.is_featured && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      Mis en avant
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contenu du témoignage */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Témoignage</h3>
                <blockquote className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r">
                  {testimony.content}
                </blockquote>
              </div>

              {/* Images */}
              {testimony.images && testimony.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Photos ({testimony.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {testimony.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={`${image}`}
                          alt={`${testimony.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations de l'auteur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de l'auteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{testimony.author_name}</p>
                  <p className="text-sm text-gray-500">Auteur</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{testimony.author_email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>

              {testimony.author_location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{testimony.author_location}</p>
                    <p className="text-sm text-gray-500">Localisation</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {testimony.createdAt && format(new Date(testimony.createdAt), "PPP", { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-500">Date de soumission</p>
                </div>
              </div>

              {testimony.approved_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(testimony.approved_at), "PPP", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-500">Date d'approbation</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{testimony.likes}</p>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
              </div>

              {testimony.scheduled_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(testimony.scheduled_date), "PPP", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-500">Date de programmation</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce témoignage ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le témoignage "{testimony.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isUpdating}
              className="bg-destructive text-default-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TestimonyDetailSkeleton() {
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
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Skeleton Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-3/4 mb-4" />
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
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
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
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
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-28 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


