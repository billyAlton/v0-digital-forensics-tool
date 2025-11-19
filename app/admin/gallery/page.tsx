// app/admin/gallery/albums/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, ImageIcon, Calendar, Eye, EyeOff, Edit, Trash2, Loader2, ExternalLink } from "lucide-react"
import { GalleryService, type GalleryAlbum } from "@/src/services/gallery.service"

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const response = await GalleryService.getAlbums()
      setAlbums(response.data)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des albums")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet album ?")) return
    
    try {
      await GalleryService.deleteAlbum(id)
      setAlbums(albums.filter(album => album._id !== id))
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression")
    }
  }

  const togglePublish = async (album: GalleryAlbum) => {
    try {
      const updatedAlbum = await GalleryService.updateAlbum(album._id!, {
        is_published: !album.is_published
      })
      setAlbums(albums.map(a => a._id === album._id ? updatedAlbum : a))
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span>Chargement des albums...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Albums</h1>
          <p className="text-gray-600 mt-2">
            {albums.length} album{albums.length !== 1 ? "s" : ""} photo{albums.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/albums/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Album
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {albums.map((album) => (
          <Card key={album._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Image de couverture */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={album.coverImage || "/placeholder.svg"}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Informations */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{album.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{album.photoCount} photos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{album.date}</span>
                        </div>
                        <Badge variant="outline">{album.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Bouton Voir (lien vers la page publique) */}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/gallery/albums/${album._id}`} >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(album)}
                      >
                        {album.is_published ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/gallery/albums/${album._id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlbum(album._id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{album.description}</p>

                  <div className="flex items-center gap-2">
                    {album.is_published ? (
                      <Badge variant="default">Publié</Badge>
                    ) : (
                      <Badge variant="outline">Brouillon</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      Ordre: {album.order}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun album pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier album photo
            </p>
            <Button asChild>
              <Link href="/admin/gallery/albums/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer un album
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}