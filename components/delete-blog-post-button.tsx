// components/delete-blog-post-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { BlogPostService } from "@/src/services/blog.service"
import { toast } from "sonner"

interface DeleteBlogPostButtonProps {
  postId: string
  size?: "sm" | "default" | "lg"
  onSuccess?: () => void
}

export function DeleteBlogPostButton({ postId, size = "default", onSuccess }: DeleteBlogPostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return
    }

    try {
      setIsDeleting(true)
      await BlogPostService.deleteBlogPost(postId)
      toast.success("Article supprimé avec succès")
      onSuccess?.()
    } catch (error: any) {
      toast.error("Erreur lors de la suppression: " + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size={size}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}