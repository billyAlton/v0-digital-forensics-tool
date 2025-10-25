"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { DeleteEventButton } from "@/components/delete-event-button"
import { EventService, Event } from "@/src/services/event.service";

export default  function EventsPage() {
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
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">
            Manage church events and services
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.map((event) => (
          <Card key={event._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className="mt-2" variant="secondary">
                    {event.event_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(
                      new Date(event.start_date),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
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
                    <span>Max: {event.max_attendees} attendees</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-700 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  <Link href={`/admin/events/${event._id}`}>View</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/admin/events/${event._id}/edit`}>Edit</Link>
                </Button>{/* 
                <DeleteEventButton eventId={event._id} size="sm" /> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!events ||
        (events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first event
              </p>
              <Button asChild>
                <Link href="/admin/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
