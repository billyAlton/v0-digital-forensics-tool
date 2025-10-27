"use client";

import { useEffect, useState } from "react";
import { EventService, Event } from "@/src/services/event.service";
import { EventForm } from "@/components/event-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/lib/apiCaller";

// Composant Carousel pour les images
function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
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
  const baseMediaUrl = BASE_URL.replace("/api", "");

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-t-lg overflow-hidden group">
      {/* Image */}
      {/* <img
        src={images[currentIndex]}
        alt={`Event image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      /> */}
      <img
        src={`${baseMediaUrl}${images[currentIndex]}`}
        alt={`Image ${currentIndex + 1}`}
        className="rounded-lg object-cover w-full h-64"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Navigation buttons - visible on hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export default function NewEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getAllEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchEvents();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">
            Add or view events in the calendar
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Event
          </Button>
        )}
      </div>

      {showForm && <EventForm onSuccess={handleFormSuccess} />}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No events found.</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="h-[600px] overflow-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event._id}
                className="hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden"
              >
                {/* Image Carousel */}
                <ImageCarousel images={event.images || []} />

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {event.event_type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-primary shrink-0" />
                      <span className="line-clamp-1">
                        {new Date(event.start_date).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </p>

                    {event.location && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </p>
                    )}

                    {event.max_attendees && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-primary shrink-0" />
                        <span>Max: {event.max_attendees} personnes</span>
                      </p>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  <Button variant="outline" className="w-full mt-4">
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
