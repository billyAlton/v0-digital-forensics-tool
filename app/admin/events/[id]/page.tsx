"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, MapPin, Users, Edit, ArrowLeft } from "lucide-react"
import { DeleteEventButton } from "@/components/delete-event-button"
import { EventService, Event } from "@/src/services/event.service"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        const { id } = await params
        const eventData = await EventService.getEventById(id)
        setEvent(eventData)
      } catch (err: any) {
        console.error("Erreur chargement événement:", err.message)
        setError("Impossible de charger l'événement")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [params])

  if (loading) {
    return <EventDetailSkeleton />
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h2>
        <p className="text-gray-600 mb-6">{error || "L'événement n'existe pas"}</p>
        <Button asChild>
          <Link href="/admin/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Bouton de retour */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
          <Link href="/admin/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge className="capitalize">{event.event_type}</Badge>
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
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/events/${event._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <DeleteEventButton 
            eventId={event._id!} 
            onDelete={() => router.push("/admin/events")}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Date de début</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.start_date), "PPP 'à' HH:mm")}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Date de fin</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.end_date), "PPP 'à' HH:mm")}
                  </div>
                </div>
              </div>
              {event.location && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lieu</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section des inscriptions - À adapter selon votre API */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Inscriptions ({event.registrations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {event.registrations && event.registrations.length > 0 ? (
                <div className="space-y-2">
                  {event.registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {reg.user?.first_name} {reg.user?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">Statut: {reg.status}</p>
                      </div>
                      <Badge variant={reg.status === "attended" ? "default" : "secondary"}>
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Aucune inscription pour le moment</p>
              )}
            </CardContent>
          </Card> */}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Inscrits</span>
                </div>
                <span className="text-2xl font-bold">{event.max_attendees || 0}</span>
              </div>
              {event.max_attendees && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Capacité max</span>
                  </div>
                  <span className="text-2xl font-bold">{event.max_attendees}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Type</span>
                <Badge variant="secondary" className="capitalize">
                  {event.event_type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Statut</span>
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
              {event.max_attendees && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Places restantes</span>
                  <span className="font-medium">
                    {event.max_attendees - (event.max_attendees || 0)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Composant Skeleton pour le chargement
function EventDetailSkeleton() {
  return (
    <div>
      {/* Skeleton pour le bouton de retour */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-8 w-16 mx-auto" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}