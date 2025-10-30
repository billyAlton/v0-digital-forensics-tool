"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SermonForm } from "@/components/sermon-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { SermonService, type Sermon } from "@/src/services/sermon.service"
import { toast } from "sonner"

export default function EditSermonPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger le sermon
  useEffect(() => {
    loadSermon()
  }, [id])

  const loadSermon = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SermonService.getSermonById(id)
      setSermon(data.data)
    } catch (err: any) {
      console.error("Erreur chargement sermon:", err)
      const errorMessage = err.response?.status === 404 
        ? "Sermon non trouvé" 
        : err.message || "Erreur lors du chargement du sermon"
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    toast.success("Sermon modifié avec succès")
    router.push("/admin/sermons")
    router.refresh()
  }

  const handleCancel = () => {
    router.push("/admin/sermons")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Chargement du sermon...</p>
        </div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error || "Sermon non trouvé"}
              </h3>
              <p className="text-gray-600 mb-6">
                {error?.includes("non trouvé") 
                  ? "Le sermon que vous essayez de modifier n'existe pas ou a été supprimé."
                  : "Une erreur est survenue lors du chargement du sermon."
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadSermon}>
                  Réessayer
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/sermons">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux sermons
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/sermons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux sermons
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier le sermon</h1>
        <p className="text-gray-600 mt-2">
          Mettez à jour les détails et les médias du sermon "{sermon.title}"
        </p>
        
        {/* Informations du sermon */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Pasteur:</span>
            {sermon.pastor_name}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Date:</span>
            {new Date(sermon.sermon_date).toLocaleDateString("fr-FR")}
          </div>
          {sermon.series && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Série:</span>
              {sermon.series}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium">ID:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {sermon._id}
            </code>
          </div>
        </div>
      </div>

      <SermonForm 
        sermon={sermon}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}