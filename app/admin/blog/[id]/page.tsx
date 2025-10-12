import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Edit, Eye, User } from "lucide-react"
import { DeleteBlogPostButton } from "@/components/delete-blog-post-button"

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, profiles(first_name, last_name)")
    .eq("id", id)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"}
            >
              {post.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/blog/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteBlogPostButton postId={id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {post.featured_image && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={post.featured_image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {post.excerpt && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 italic">{post.excerpt}</p>
                </div>
              )}
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap">{post.content}</div>
              </div>
            </CardContent>
          </Card>

          {post.tags && post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="h-4 w-4" />
                  <span>Author</span>
                </div>
                <p className="font-medium">
                  {post.profiles?.first_name} {post.profiles?.last_name}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <p className="font-medium">{format(new Date(post.created_at), "PPP")}</p>
              </div>
              {post.published_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published</span>
                  </div>
                  <p className="font-medium">{format(new Date(post.published_at), "PPP")}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Eye className="h-4 w-4" />
                  <span>Views</span>
                </div>
                <p className="text-2xl font-bold">{post.views}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Slug</p>
                  <p className="font-mono text-sm">{post.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
