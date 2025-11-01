"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Plus, FileText, Eye, Calendar, Search, Filter, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { DeleteBlogPostButton } from "@/components/delete-blog-post-button"
import { BlogPostService, type BlogPost } from "@/src/services/blog.service"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")

  // Charger les articles
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await BlogPostService.getAllBlogPosts()
      setPosts(response.data)
      setFilteredPosts(response.data)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des articles")
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  // Appliquer les filtres
  useEffect(() => {
    let result = posts

    // Filtre de recherche
    if (searchTerm) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter(post => post.status === statusFilter)
    }

    // Filtre par tag
    if (tagFilter !== "all") {
      result = result.filter(post => post.tags.includes(tagFilter))
    }

    setFilteredPosts(result)
  }, [posts, searchTerm, statusFilter, tagFilter])

  // Récupérer les tags uniques pour le filtre
  const uniqueTags = [...new Set(posts.flatMap(post => post.tags))].filter(Boolean)

  const handleDeleteSuccess = () => {
    loadPosts() // Recharger la liste après suppression
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={loadPosts}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles du blog</h1>
          <p className="text-gray-600 mt-2">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} trouvé{filteredPosts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par tag */}
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tags</SelectItem>
                {uniqueTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bouton reset filtres */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setTagFilter("all")
              }}
              disabled={!searchTerm && statusFilter === "all" && tagFilter === "all"}
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des articles */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <BlogPostCard 
            key={post._id} 
            post={post} 
            onDelete={handleDeleteSuccess}
          />
        ))}
      </div>

      {/* État vide avec filtres actifs */}
      {filteredPosts.length === 0 && posts.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600 mb-4">Aucun article ne correspond à vos critères de recherche</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setTagFilter("all")
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* État vide sans articles */}
      {posts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article pour le moment</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier article</p>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel article
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Composant BlogPostCard séparé
interface BlogPostCardProps {
  post: BlogPost
  onDelete: () => void
}

function BlogPostCard({ post, onDelete }: BlogPostCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "draft":
        return "secondary"
      case "archived":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Publié"
      case "draft":
        return "Brouillon"
      case "archived":
        return "Archivé"
      default:
        return status
    }
  }

  return (
    <Card key={post._id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-48 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <FileText className="h-12 w-12 text-green-600" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                <p className="text-gray-600 mt-1">
                  Slug: <code className="text-sm bg-gray-100 px-1 rounded">{post.slug}</code>
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={getStatusVariant(post.status)}>
                    {getStatusText(post.status)}
                  </Badge>
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/blog/${post._id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/blog/${post._id}/edit`}>
                    Modifier
                  </Link>
                </Button>
                <DeleteBlogPostButton 
                  postId={post._id!} 
                  size="sm" 
                  onSuccess={onDelete}
                />
              </div>
            </div>
            <p className="mt-3 text-gray-700 line-clamp-2">
              {post.excerpt || "Aucun extrait disponible"}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.published_at
                  ? format(new Date(post.published_at), "dd/MM/yyyy")
                  : format(new Date(post.createdAt!), "dd/MM/yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {post.views || 0} vues
              </div>
              {post.reading_time > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Temps de lecture:</span>
                  {post.reading_time} min
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}