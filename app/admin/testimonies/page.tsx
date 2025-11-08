"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, User, Mail, MapPin, Eye, Edit, Filter, X, CheckCircle, Clock, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TestimonyService, Testimony } from "@/src/services/testimony.service";
import { BASE_URL } from "@/lib/apiCaller";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Composant pour afficher les images des témoignages
function TestimonyImages({ images, title }: { images: string[], title: string }) {
  const baseMediaUrl = BASE_URL.replace("/api", "");

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
        <span className="text-gray-400">Pas d'image</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden">
      <img
        src={`${images[0]}`}
        alt={title}
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
          +{images.length - 1}
        </div>
      )}
    </div>
  );
}

// Badge de statut avec couleurs
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
    approved: { label: "Approuvé", variant: "default" as const, icon: CheckCircle },
    scheduled: { label: "Programmé", variant: "outline" as const, icon: Calendar },
    archived: { label: "Archivé", variant: "secondary" as const, icon: Archive },
    rejected: { label: "Rejeté", variant: "destructive" as const, icon: X }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="capitalize">
      <IconComponent className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Badge de catégorie
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

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [filteredTestimonies, setFilteredTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const response = await TestimonyService.getAllTestimonies();
      setTestimonies(response.data);
      setFilteredTestimonies(response.data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des témoignages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = testimonies;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(testimony =>
        testimony.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimony.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimony.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimony.author_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(testimony => testimony.status === statusFilter);
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(testimony => testimony.category === categoryFilter);
    }

    setFilteredTestimonies(filtered);
  }, [testimonies, searchTerm, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all";

  if (loading) {
    return <TestimoniesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={fetchTestimonies}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-gray-600 mt-2">
            Gérez les témoignages soumis par la communauté
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonies/stats">
            <Plus className="mr-2 h-4 w-4" />
            Voir les statistiques
          </Link>
        </Button>
      </div>

      {/* Section Filtres */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Recherche */}
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-2 block">Rechercher</label>
              <Input
                placeholder="Rechercher par titre, contenu, auteur ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtre par statut */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="scheduled">Programmé</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par catégorie */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="guerison">Guérison</SelectItem>
                  <SelectItem value="famille">Famille</SelectItem>
                  <SelectItem value="finances">Finances</SelectItem>
                  <SelectItem value="delivrance">Délivrance</SelectItem>
                  <SelectItem value="miracle">Miracle</SelectItem>
                  <SelectItem value="transformation">Transformation</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bouton réinitialiser */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Résultats du filtrage */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredTestimonies.length} témoignage{filteredTestimonies.length > 1 ? 's' : ''} trouvé{filteredTestimonies.length > 1 ? 's' : ''}
              {hasActiveFilters && " (filtrés)"}
            </p>
          </div>
        </CardContent>
      </Card>

      {filteredTestimonies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? "Aucun témoignage correspond aux filtres" : "Aucun témoignage"}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? "Essayez de modifier vos critères de recherche" 
                : "Les témoignages soumis apparaîtront ici"
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTestimonies.map((testimony) => (
            <Card key={testimony._id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Section Images */}
                <div className="md:w-1/3">
                  <TestimonyImages images={testimony.images || []} title={testimony.title} />
                </div>
                
                {/* Section Contenu */}
                <div className="flex-1 md:w-2/3">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 line-clamp-2">{testimony.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <StatusBadge status={testimony.status} />
                          <CategoryBadge category={testimony.category} />
                          {testimony.is_featured && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Mis en avant
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Informations de l'auteur */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{testimony.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{testimony.author_email}</span>
                      </div>
                      {testimony.author_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{testimony.author_location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(testimony.createdAt!), "PPP", { locale: fr })}
                        </span>
                      </div>
                    </div>

                    {/* Contenu du témoignage */}
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-3 italic">
                        "{testimony.content}"
                      </p>
                    </div>

                    {/* Métriques */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>❤️ {testimony.likes} likes</span>
                      {testimony.images && testimony.images.length > 0 && (
                        <span>📷 {testimony.images.length} photo{testimony.images.length > 1 ? 's' : ''}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/admin/testimonies/${testimony._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/admin/testimonies/${testimony._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant Skeleton pour le chargement
function TestimoniesSkeleton() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Skeleton pour les filtres */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Skeleton Image */}
              <div className="md:w-1/3">
                <Skeleton className="w-full h-48 rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
              </div>
              
              {/* Skeleton Content */}
              <div className="flex-1 md:w-2/3 p-6">
                <div className="space-y-3">
                  {/* Titre */}
                  <Skeleton className="h-6 w-3/4" />
                  
                  {/* Badges */}
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>

                  {/* Informations auteur */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  {/* Métriques */}
                  <Skeleton className="h-4 w-20" />

                  {/* Boutons */}
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}