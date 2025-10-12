import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, FileText, Eye, Calendar } from "lucide-react"
import { format } from "date-fns"
import { DeleteBlogPostButton } from "@/components/delete-blog-post-button"

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*, profiles(first_name, last_name)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage church news and blog articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts?.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
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
                        by {post.profiles?.first_name} {post.profiles?.last_name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"
                          }
                        >
                          {post.status}
                        </Badge>
                        {post.tags?.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/blog/${post.id}`}>View</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteBlogPostButton postId={post.id} size="sm" />
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {post.published_at
                        ? format(new Date(post.published_at), "MMM dd, yyyy")
                        : format(new Date(post.created_at), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {post.views} views
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!posts ||
        (posts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first post</p>
              <Button asChild>
                <Link href="/admin/blog/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
