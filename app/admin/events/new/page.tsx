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
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    fetchEvents(); // rafraîchir la liste après création
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

      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && events.length === 0 && <p>No events found.</p>}

      {!loading && events.length > 0 && (
        <div className="h-[600px] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="capitalize">
                      {event.event_type}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />{" "}
                    {new Date(event.start_date).toLocaleString()} -{" "}
                    {new Date(event.end_date).toLocaleString()}
                  </p>
                  {event.location && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} /> {event.location}
                    </p>
                  )}
                  {event.max_attendees && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} /> Max attendees: {event.max_attendees}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-700">{event.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
