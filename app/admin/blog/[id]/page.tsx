"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Edit,
  Eye,
  User,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { DeleteBlogPostButton } from "@/components/delete-blog-post-button";
import { BlogPostService, type BlogPost } from "@/src/services/blog.service";
import { toast } from "sonner";

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'article
  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BlogPostService.getBlogPostById(id);
      setPost(data);
    } catch (err: any) {
      console.error("Erreur chargement article:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Article non trouvé"
          : err.message || "Erreur lors du chargement de l'article";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    toast.success("Article supprimé avec succès");
    router.push("/admin/blog");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Publié";
      case "draft":
        return "Brouillon";
      case "archived":
        return "Archivé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error || "Article non trouvé"}
              </h3>
              <p className="text-gray-600 mb-6">
                {error?.includes("non trouvé")
                  ? "L'article que vous recherchez n'existe pas ou a été supprimé."
                  : "Une erreur est survenue lors du chargement de l'article."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadPost}>Réessayer</Button>
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
    );
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={getStatusVariant(post.status)}>
              {getStatusText(post.status)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views || 0} vues
            </Badge>
            {post.reading_time > 0 && (
              <Badge variant="outline">
                {post.reading_time} min de lecture
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/blog/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <DeleteBlogPostButton postId={id} onSuccess={handleDeleteSuccess} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image à la une */}
          {post.featured_image && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    // Cacher l'image si elle ne charge pas
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Contenu */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.excerpt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Extrait</h3>
                  <p className="text-blue-800 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              )}
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto p-4 border rounded w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {post.content}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Détails de l'article */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="h-4 w-4" />
                  <span>Auteur</span>
                </div>
                <p className="font-medium">
                  {post.author_id || "Auteur inconnu"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Créé le</span>
                </div>
                <p className="font-medium">
                  {post.createdAt
                    ? format(new Date(post.createdAt), "dd/MM/yyyy")
                    : "Date inconnue"}
                </p>
              </div>

              {post.published_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Publié le</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(post.published_at), "dd/MM/yyyy")}
                  </p>
                </div>
              )}

              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Modifié le</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(post.updatedAt), "dd/MM/yyyy")}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Eye className="h-4 w-4" />
                  <span>Vues</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {post.views || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Slug</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block break-all">
                  {post.slug}
                </code>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">URL complète</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/blog/${post.slug}`
                    : `/blog/${post.slug}`}
                </code>
              </div>

              {post.excerpt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Meta description</p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/blog/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier l'article
                </Link>
              </Button>

              {post.status === "draft" && (
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Prévisualiser
                  </Link>
                </Button>
              )}

              {post.status === "published" && (
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir en ligne
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
