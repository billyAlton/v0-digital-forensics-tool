// app/admin/gallery/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, ImageIcon, Calendar, Eye, EyeOff, Edit, Trash2, Loader2, ExternalLink, Video } from "lucide-react"
import { GalleryService, type GalleryAlbum, type GalleryVideo } from "@/src/services/gallery.service"

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [videos, setVideos] = useState<GalleryVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'albums' | 'videos'>('albums')

  useEffect(() => {
    loadGalleryData()
  }, [])

  const loadGalleryData = async () => {
    try {
      setLoading(true)
      const [albumsResponse, videosResponse] = await Promise.all([
        GalleryService.getAlbums(),
        GalleryService.getVideos()
      ])
      setAlbums(albumsResponse.data)
      setVideos(videosResponse.data)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement de la galerie")
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

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) return
    
    try {
      await GalleryService.deleteVideo(id)
      setVideos(videos.filter(video => video._id !== id))
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression")
    }
  }

  const togglePublishAlbum = async (album: GalleryAlbum) => {
    try {
      const updatedAlbum = await GalleryService.updateAlbum(album._id!, {
        is_published: !album.is_published
      })
      setAlbums(albums.map(a => a._id === album._id ? updatedAlbum : a))
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification")
    }
  }

  const togglePublishVideo = async (video: GalleryVideo) => {
    try {
      const updatedVideo = await GalleryService.updateVideo(video._id!, {
        is_published: !video.is_published
      })
      setVideos(videos.map(v => v._id === video._id ? updatedVideo : v))
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification")
    }
  }

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`
    }
    return views.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span>Chargement de la galerie...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de la Galerie</h1>
          <p className="text-gray-600 mt-2">
            {activeTab === 'albums' 
              ? `${albums.length} album${albums.length !== 1 ? 's' : ''} photo${albums.length !== 1 ? 's' : ''}`
              : `${videos.length} vidéo${videos.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant={activeTab === 'albums' ? "default" : "outline"}>
            <Link href="/admin/gallery/albums/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Album
            </Link>
          </Button>
          <Button asChild variant={activeTab === 'videos' ? "default" : "outline"}>
            <Link href="/admin/gallery/videos/new">
              <Video className="mr-2 h-4 w-4" />
              Nouvelle Vidéo
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('albums')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'albums'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Albums ({albums.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vidéos ({videos.length})
            </div>
          </button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Contenu des onglets */}
      {activeTab === 'albums' ? (
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
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/gallery/albums/${album._id}`} >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublishAlbum(album)}
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
      ) : (
        <div className="grid gap-6">
          {videos.map((video) => (
            <Card key={video._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Miniature */}
                  <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{video.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            <span>{video.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{formatViews(video.views)} vues</span>
                          </div>
                          <Badge variant="outline">{video.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/gallery/videos/${video._id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublishVideo(video)}
                        >
                          {video.is_published ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/gallery/videos/${video._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video._id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {video.description && (
                      <p className="text-gray-700 mb-3">{video.description}</p>
                    )}

                    <div className="flex items-center gap-2">
                      {video.is_published ? (
                        <Badge variant="default">Publié</Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        Ordre: {video.order}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {videos.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune vidéo pour le moment
                </h3>
                <p className="text-gray-600 mb-4">
                  Commencez par ajouter votre première vidéo
                </p>
                <Button asChild>
                  <Link href="/admin/gallery/videos/new">
                    <Video className="mr-2 h-4 w-4" />
                    Ajouter une vidéo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}