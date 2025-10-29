"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventService, Event } from "@/src/services/event.service";
import { BASE_URL } from "@/lib/apiCaller";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const baseMediaUrl = BASE_URL.replace("/api", "");
  const [isEditing, setIsEditing] = useState(false);

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

  function EventForm({
    event,
    onCancel,
    onSuccess,
  }: {
    event: Event;
    onCancel: () => void;
    onSuccess: () => void;
  }) {
    const [formData, setFormData] = useState(event);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await EventService.updateEvent(event._id!, {
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        });
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Erreur lors de la mise à jour");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start date</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date.slice(0, 16)}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End date</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date.slice(0, 16)}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max attendees</label>
          <input
            type="number"
            name="max_attendees"
            value={formData.max_attendees ?? ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    );
  }


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
              {event.images && event.images.length > 0 && (
                <div className="mb-3">
                  <img
                    src={`${baseMediaUrl}${event.images[0]}`}
                    alt={event.title}
                    className="rounded-md object-cover w-full h-48"
                  />
                </div>
              )}

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
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedEvent(event)}
                >
                  View Details
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/admin/events/${event._id}/edit`}>Edit</Link>
                </Button>
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

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-2">
                  {selectedEvent.title}
                </DialogTitle>
                <Badge variant="secondary" className="capitalize">
                  {selectedEvent.event_type}
                </Badge>
              </DialogHeader>

              {/* Images */}
              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="my-3">
                  <img
                    src={`${baseMediaUrl}${selectedEvent.images[0]}`}
                    alt={selectedEvent.title}
                    className="rounded-md object-cover w-full h-56"
                  />
                </div>
              )}

              {/* Infos */}
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(
                    new Date(selectedEvent.start_date),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </p>

                {selectedEvent.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedEvent.location}
                  </p>
                )}

                {selectedEvent.max_attendees && (
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Max: {selectedEvent.max_attendees} attendees
                  </p>
                )}

                {selectedEvent.description && (
                  <p className="mt-4 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <DialogFooter className="mt-4 flex gap-3 justify-end">
                <Button asChild variant="outline">
                  <Link href={`/admin/events/${selectedEvent._id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <DeleteEventButton eventId={selectedEvent._id!} />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
