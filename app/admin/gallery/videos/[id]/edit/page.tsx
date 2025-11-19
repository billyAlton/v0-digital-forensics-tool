// app/admin/gallery/videos/[id]/edit/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Video, Loader2 } from "lucide-react"
import { GalleryService, type GalleryVideo } from "@/src/services/gallery.service"

const VIDEO_CATEGORIES = [
  "Célébrations",
  "Cérémonies", 
  "Retraites",
  "Évangélisation",
  "Pèlerinages",
  "Cultes",
  "Jeunesse",
  "Humanitaire",
  "Enseignements",
  "Autre"
]

export default function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingVideo, setLoadingVideo] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<GalleryVideo>>({
    title: "",
    description: "",
    thumbnail: "",
    videoUrl: "",
    duration: "",
    views: 0,
    category: "Enseignements",
    is_published: false,
    order: 0
  })

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoadingVideo(true)
        const { id } = await params
        const videoData = await GalleryService.getVideoById(id)
        setFormData(videoData)
      } catch (err: any) {
        setError("Erreur lors du chargement de la vidéo")
        console.error("Erreur:", err)
      } finally {
        setLoadingVideo(false)
      }
    }

    loadVideo()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.title?.trim()) {
        throw new Error("Le titre est obligatoire")
      }
      if (!formData.thumbnail?.trim()) {
        throw new Error("La miniature est obligatoire")
      }
      if (!formData.videoUrl?.trim()) {
        throw new Error("L'URL de la vidéo est obligatoire")
      }
      if (!formData.duration?.trim()) {
        throw new Error("La durée est obligatoire")
      }

      // Nettoyer les données
      const cleanedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        thumbnail: formData.thumbnail.trim(),
        videoUrl: formData.videoUrl.trim(),
        duration: formData.duration.trim(),
        views: formData.views || 0,
        order: formData.order || 0
      }

      const { id } = await params
      await GalleryService.updateVideo(id, cleanedData)
      router.push("/admin/gallery")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de la vidéo")
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof GalleryVideo, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNumberChange = (field: keyof GalleryVideo, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value)
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  if (loadingVideo) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span>Chargement de la vidéo...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/gallery")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la Vidéo</h1>
            <p className="text-gray-600 mt-1">Modifiez les informations de la vidéo</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de la vidéo */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de la vidéo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de la vidéo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: Campagne d'Évangélisation 2024"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée *</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      placeholder="Ex: 12:45, 1:30:15"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de la vidéo..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description?.length || 0}/500 caractères
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="views">Nombre de vues</Label>
                    <Input
                      id="views"
                      type="number"
                      value={formData.views}
                      onChange={(e) => handleNumberChange('views', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="order">Ordre d'affichage</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleNumberChange('order', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URLs */}
            <Card>
              <CardHeader>
                <CardTitle>URLs multimédias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="thumbnail">URL de la miniature *</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => handleChange('thumbnail', e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl">URL de la vidéo *</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                {formData.thumbnail && (
                  <div className="border rounded-lg p-4">
                    <Label className="text-sm font-medium mb-2 block">Aperçu de la miniature</Label>
                    <div className="relative h-48 rounded-md overflow-hidden">
                      <img
                        src={formData.thumbnail}
                        alt="Aperçu de la miniature"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Publication */}
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published" className="cursor-pointer">
                    Publier la vidéo
                  </Label>
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleChange('is_published', checked)}
                  />
                </div>

                {formData.is_published && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>Publié</strong> - Cette vidéo sera visible dans la galerie publique
                    </p>
                  </div>
                )}

                {!formData.is_published && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Brouillon</strong> - Cette vidéo n'est pas encore visible publiquement
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aperçu */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu de la vidéo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée:</span>
                  <span className="font-medium">{formData.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vues:</span>
                  <span className="font-medium">{formData.views}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-medium">
                    {formData.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Mettre à jour
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/gallery")}
                >
                  Annuler
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}