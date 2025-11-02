"use client"

import { useState, useEffect } from "react"
import { PrayerRequestForm } from "@/components/prayer-request-form"
import { PrayerRequestService, type PrayerRequest } from "@/src/services/prayer.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function EditPrayerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadPrayerRequest = async () => {
      try {
        setLoading(true)
        setError(null)
        const { id } = await params
        
        if (!id) {
          throw new Error("ID de demande non fourni")
        }
        
        const prayerData = await PrayerRequestService.getPrayerRequestById(id)
        setPrayer(prayerData)
      } catch (err: any) {
        console.error("Erreur chargement demande:", err.message)
        setError(err.message || "Impossible de charger la demande de prière")
        setShowErrorDialog(true)
      } finally {
        setLoading(false)
      }
    }

    loadPrayerRequest()
  }, [params])

  const handleSuccess = () => {
    router.push("/admin/prayers")
    router.refresh()
  }

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false)
    router.push("/admin/prayers")
  }

  if (loading) {
    return <EditPrayerSkeleton />
  }

  if (error && !showErrorDialog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="text-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <Button asChild>
          <Link href="/admin/prayers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux demandes
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      {/* Dialog d'erreur */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erreur de chargement
            </AlertDialogTitle>
            <AlertDialogDescription>
              {error || "Impossible de charger la demande de prière. Cette demande peut avoir été supprimée ou vous n'avez pas les permissions nécessaires."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              Retour aux demandes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bouton de retour */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
          <Link href="/admin/prayers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier la demande</h1>
        <p className="text-gray-600 mt-2">
          Mettez à jour les détails de la demande de prière {prayer && `"${prayer.title}"`}
        </p>
      </div>
      
      {/* Formulaire */}
      {prayer && (
        <PrayerRequestForm 
          prayer={prayer} 
          onSuccess={handleSuccess}
          submitText="Mettre à jour"
        />
      )}
    </div>
  )
}

// Composant Skeleton pour le chargement
function EditPrayerSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-6">
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

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
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