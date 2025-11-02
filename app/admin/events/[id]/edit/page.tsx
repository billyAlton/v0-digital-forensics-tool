"use client"

import { useState, useEffect } from "react"
import { EventForm } from "@/components/event-form"
import { EventService, Event } from "@/src/services/event.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditEventPage({
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

  const handleSuccess = () => {
    router.push("/admin/events")
    router.refresh()
  }

  if (loading) {
    return <EditEventSkeleton />
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier l'événement</h1>
        <p className="text-gray-600 mt-2">
          Mettez à jour les détails de l'événement "{event.title}"
        </p>
      </div>
      
      <EventForm 
        event={event} 
        onSuccess={handleSuccess}
        submitText="Mettre à jour"
      />
    </div>
  )
}

// Composant Skeleton pour le chargement
function EditEventSkeleton() {
  return (
    <div>
      {/* Skeleton pour le bouton de retour */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Skeleton pour l'en-tête */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Skeleton pour le formulaire */}
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Skeleton pour les images */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}