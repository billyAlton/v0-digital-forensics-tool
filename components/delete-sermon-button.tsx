// components/delete-sermon-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { SermonService } from "@/src/services/sermon.service"
import { toast } from "sonner"

interface DeleteSermonButtonProps {
  sermonId: string
  size?: "sm" | "default" | "lg"
  onSuccess?: () => void
}

export function DeleteSermonButton({ sermonId, size = "default", onSuccess }: DeleteSermonButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sermon ?")) {
      return
    }

    try {
      setIsDeleting(true)
      await SermonService.deleteSermon(sermonId)
      toast.success("Sermon supprimé avec succès")
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
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}