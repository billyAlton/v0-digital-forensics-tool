"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { BlogPostService, type BlogPost } from "@/src/services/blog.service"
import { toast } from "sonner"

interface BlogPostFormProps {
  post?: BlogPost
  onSuccess?: () => void
  onCancel?: () => void
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    featured_image: post?.featured_image || "",
    status: post?.status || "draft",
    tags: post?.tags?.join(", ") || "",
  })

  // Vérifier la disponibilité du slug
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (formData.slug && formData.slug.length > 2) {
        try {
          const available = await BlogPostService.checkSlugAvailability(
            formData.slug, 
            post?._id
          )
          setSlugAvailable(available)
        } catch (error) {
          console.error("Erreur vérification slug:", error)
          setSlugAvailable(null)
        }
      } else {
        setSlugAvailable(null)
      }
    }

    const timeoutId = setTimeout(checkSlugAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.slug, post?._id])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: post ? formData.slug : generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation supplémentaire
    if (!formData.title.trim()) {
      setError("Le titre est requis")
      setIsLoading(false)
      return
    }

    if (!formData.slug.trim()) {
      setError("Le slug est requis")
      setIsLoading(false)
      return
    }

    if (!formData.content.trim()) {
      setError("Le contenu est requis")
      setIsLoading(false)
      return
    }

    if (slugAvailable === false) {
      setError("Ce slug est déjà utilisé par un autre article")
      setIsLoading(false)
      return
    }

    try {
      // Préparer les données pour l'API
      const postData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        featured_image: formData.featured_image.trim() || null,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()).filter(tag => tag !== "") : [],
      }

      let result: BlogPost

      if (post?._id) {
        // Mettre à jour l'article existant
        result = await BlogPostService.updateBlogPost(post._id, postData)
        toast.success("Article mis à jour avec succès")
      } else {
        // Créer un nouvel article
        result = await BlogPostService.createBlogPost(postData)
        toast.success("Article créé avec succès")
      }

      // Gérer le succès
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/admin/blog")
        router.refresh()
      }

    } catch (err: any) {
      console.error("Erreur sauvegarde article:", err)
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Une erreur est survenue lors de la sauvegarde"
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const isFormValid = formData.title.trim() !== "" && 
                     formData.slug.trim() !== "" && 
                     formData.content.trim() !== "" &&
                     slugAvailable !== false

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* En-tête */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {post ? "Modifier l'article" : "Nouvel article"}
            </h2>
            {post && (
              <div className="text-sm text-muted-foreground">
                ID: {post._id}
              </div>
            )}
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              required
              placeholder="Entrez le titre de l'article"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Slug avec indicateur de disponibilité */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              required
              placeholder="url-de-l-article"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              disabled={isLoading}
              className={slugAvailable === false ? "border-red-500" : slugAvailable === true ? "border-green-500" : ""}
            />
            <div className="flex items-center gap-2 text-sm">
              <p className="text-gray-600">Version URL du titre</p>
              {slugAvailable === true && (
                <span className="text-green-600 font-medium">✓ Slug disponible</span>
              )}
              {slugAvailable === false && (
                <span className="text-red-600 font-medium">✗ Slug déjà utilisé</span>
              )}
              {formData.slug && slugAvailable === null && (
                <span className="text-blue-600 font-medium">⏳ Vérification...</span>
              )}
            </div>
          </div>

          {/* Extrait */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              rows={2}
              placeholder="Un résumé court de l'article..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              {formData.excerpt.length}/300 caractères
            </p>
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Contenu <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              rows={12}
              required
              placeholder="Écrivez le contenu de votre article ici..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formData.content.length} caractères</span>
              <span>
                Temps de lecture estimé: {Math.ceil(formData.content.split(/\s+/).length / 200)} min
              </span>
            </div>
          </div>

          {/* Image et statut */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="featured_image">Image à la une</Label>
              <Input
                id="featured_image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                disabled={isLoading}
              />
              {formData.featured_image && (
                <div className="mt-2">
                  <img 
                    src={formData.featured_image} 
                    alt="Aperçu" 
                    className="h-20 w-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Statut <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
              {formData.status === "published" && (
                <p className="text-sm text-green-600">
                  L'article sera visible publiquement
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              placeholder="ex: communauté, foi, événements"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              Séparez les tags par des virgules
            </p>
            {formData.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.split(",").map((tag, index) => (
                  tag.trim() && (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {tag.trim()}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !isFormValid}
              className="min-w-32"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {post ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                post ? "Mettre à jour" : "Créer l'article"
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>

          {/* Indicateur de validation */}
          {!isFormValid && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-600">
                ⚠️ Veuillez remplir tous les champs obligatoires et vous assurer que le slug est disponible
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}