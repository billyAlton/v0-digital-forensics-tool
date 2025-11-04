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



export default function NewEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

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
    </div>
  );
}
