"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, MapPin, Users, Edit, Eye, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventService, Event } from "@/src/services/event.service";
import { BASE_URL } from "@/lib/apiCaller";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Composant Carousel pour les images
function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const baseMediaUrl = BASE_URL.replace("/api", "");

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
        <span className="text-gray-400">Pas d'image</span>
      </div>
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden group">
      {/* Image */}
      <img
        src={`${baseMediaUrl}${images[currentIndex]}`}
        alt={`${title} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Navigation buttons - visible on hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-1.5 py-0.5 rounded text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const baseMediaUrl = BASE_URL.replace("/api", "");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getAllEvents();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = events;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type d'événement
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter(event => event.event_type === eventTypeFilter);
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      const now = new Date();
      if (statusFilter === "upcoming") {
        filtered = filtered.filter(event => new Date(event.start_date) > now);
      } else if (statusFilter === "past") {
        filtered = filtered.filter(event => new Date(event.start_date) <= now);
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, eventTypeFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || eventTypeFilter !== "all" || statusFilter !== "all";

  if (loading) {
    return <EventsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={fetchEvents}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-2">
            Gérez les événements et services de l'église
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Événement
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
                placeholder="Rechercher par titre, description ou lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtre par type */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium mb-2 block">Type d'événement</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="special">Événement spécial</SelectItem>
                  <SelectItem value="youth">Jeunesse</SelectItem>
                  <SelectItem value="prayer">Prières</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="past">Terminés</SelectItem>
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
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
              {hasActiveFilters && " (filtrés)"}
            </p>
          </div>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? "Aucun événement correspond aux filtres" : "Aucun événement"}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? "Essayez de modifier vos critères de recherche" 
                : "Commencez par créer votre premier événement"
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button asChild>
                <Link href="/admin/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un événement
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Section Image avec Carousel */}
                <div className="md:w-1/3">
                  <ImageCarousel images={event.images || []} title={event.title} />
                </div>
                
                {/* Section Contenu */}
                <div className="flex-1 md:w-2/3">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary" className="capitalize">
                            {event.event_type}
                          </Badge>
                          <Badge variant={
                            new Date(event.start_date) > new Date() 
                              ? "default" 
                              : "outline"
                          }>
                            {new Date(event.start_date) > new Date() 
                              ? "À venir" 
                              : "Terminé"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start_date), "PPP 'à' HH:mm")}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Maximum {event.max_attendees} participants</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/admin/events/${event._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/admin/events/${event._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </Button>
                      <DeleteEventButton 
                        eventId={event._id!} 
                        eventTitle={event.title}
                        onDelete={fetchEvents}
                        size="sm"
                      />
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
function EventsSkeleton() {
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
              {/* Skeleton Image avec Carousel */}
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

                  {/* Informations */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-20" />
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