// app/admin/gallery/albums/[id]/edit/page.tsx
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
import { ArrowLeft, Save, Plus, X, Loader2, ImageIcon } from "lucide-react"
import { GalleryService, type GalleryAlbum } from "@/src/services/gallery.service"

const CATEGORIES = [
  "Célébrations",
  "Cérémonies", 
  "Retraites",
  "Évangélisation",
  "Pèlerinages",
  "Cultes",
  "Jeunesse",
  "Humanitaire",
  "Autre"
]

export default function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingAlbum, setLoadingAlbum] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<GalleryAlbum>>({
    title: "",
    description: "",
    date: "",
    photoCount: 0,
    coverImage: "",
    images: [],
    category: "Célébrations",
    is_published: false,
    order: 0
  })

  const [newImage, setNewImage] = useState("")

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setLoadingAlbum(true)
        const { id } = await params
        const albumData = await GalleryService.getAlbumById(id)
        setFormData(albumData)
      } catch (err: any) {
        setError("Erreur lors du chargement de l'album")
        console.error("Erreur:", err)
      } finally {
        setLoadingAlbum(false)
      }
    }

    loadAlbum()
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
      if (!formData.description?.trim()) {
        throw new Error("La description est obligatoire")
      }
      if (!formData.coverImage?.trim()) {
        throw new Error("L'image de couverture est obligatoire")
      }
      if (!formData.date?.trim()) {
        throw new Error("La date est obligatoire")
      }

      // Nettoyer les données
      const cleanedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim(),
        date: formData.date.trim(),
        photoCount: formData.photoCount || 0,
        order: formData.order || 0,
        images: formData.images || []
      }

      const { id } = await params
      await GalleryService.updateAlbum(id, cleanedData)
      router.push("/admin/gallery")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'album")
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof GalleryAlbum, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNumberChange = (field: keyof GalleryAlbum, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value)
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  // Gestion des images
  const addImage = () => {
    if (!newImage.trim()) return

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), newImage.trim()]
    }))

    setNewImage("")
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }))
  }

  if (loadingAlbum) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span>Chargement de l'album...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Modifier l'Album</h1>
            <p className="text-gray-600 mt-1">Modifiez les informations de l'album photo</p>
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
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'album *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: Moisson Spirituelle 2024"
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
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      placeholder="Ex: 2024, Décembre 2024, 2023-2024"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Décrivez le contenu de cet album..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description?.length || 0}/500 caractères
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photoCount">Nombre de photos</Label>
                    <Input
                      id="photoCount"
                      type="number"
                      value={formData.photoCount}
                      onChange={(e) => handleNumberChange('photoCount', e.target.value)}
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

            {/* Image de couverture */}
            <Card>
              <CardHeader>
                <CardTitle>Image de couverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="coverImage">URL de l'image de couverture *</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => handleChange('coverImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                {formData.coverImage && (
                  <div className="border rounded-lg p-4">
                    <Label className="text-sm font-medium mb-2 block">Aperçu de la couverture</Label>
                    <div className="relative h-48 rounded-md overflow-hidden">
                      <img
                        src={formData.coverImage}
                        alt="Aperçu de couverture"
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

            {/* Images supplémentaires */}
            <Card>
              <CardHeader>
                <CardTitle>Images supplémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="URL d'une image supplémentaire"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                  />
                  <Button type="button" onClick={addImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="space-y-3">
                    <Label>Images ajoutées ({formData.images.length})</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={image}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
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
                    Publier l'album
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
                      <strong>Publié</strong> - Cet album sera visible dans la galerie publique
                    </p>
                  </div>
                )}

                {!formData.is_published && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Brouillon</strong> - Cet album n'est pas encore visible publiquement
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aperçu */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu de l'album</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Photos:</span>
                  <span className="font-medium">{formData.photoCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Images supplémentaires:</span>
                  <span className="font-medium">{formData.images?.length || 0}</span>
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