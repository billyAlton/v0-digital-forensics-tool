"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlogPostForm } from "@/components/blog-post-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"
import { BlogPostService, type BlogPost } from "@/src/services/blog.service"
import { toast } from "sonner"

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger l'article
  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BlogPostService.getBlogPostById(id)
      setPost(data)
    } catch (err: any) {
      console.error("Erreur chargement article:", err)
      const errorMessage = err.response?.status === 404 
        ? "Article non trouvé" 
        : err.message || "Erreur lors du chargement de l'article"
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    toast.success("Article modifié avec succès")
    router.push("/admin/blog")
    router.refresh()
  }

  const handleCancel = () => {
    router.push("/admin/blog")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error || "Article non trouvé"}
              </h3>
              <p className="text-gray-600 mb-6">
                {error?.includes("non trouvé") 
                  ? "L'article que vous essayez de modifier n'existe pas ou a été supprimé."
                  : "Une erreur est survenue lors du chargement de l'article."
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadPost}>
                  Réessayer
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux articles
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
      {/* Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux articles
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier l'article</h1>
        <p className="text-gray-600 mt-2">
          Mettez à jour les détails de "{post.title}"
        </p>
        
        {/* Informations de l'article */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Statut:</span>
              <p className="text-blue-800 capitalize">{post.status}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Slug:</span>
              <p className="text-blue-800 font-mono text-sm">{post.slug}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Vues:</span>
              <p className="text-blue-800">{post.views || 0}</p>
            </div>
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-blue-900">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Dates */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
            <div>
              <span className="font-medium">Créé le:</span>{" "}
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </div>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <div>
                <span className="font-medium">Modifié le:</span>{" "}
                {new Date(post.updatedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <BlogPostForm 
        post={post}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}