"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { EventService } from "@/src/services/event.service"

interface DeleteEventButtonProps {
  eventId: string
  eventTitle?: string
  onDelete?: () => void
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "destructive" | "outline" | "ghost"
}

export function DeleteEventButton({
  eventId,
  eventTitle,
  onDelete,
  size = "default",
  variant = "destructive"
}: DeleteEventButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      console.log("Suppression de l'événement:", eventId)
      await EventService.deleteEvent(eventId)
      
      // Fermer la dialog
      setIsOpen(false)
      
      // Appeler le callback personnalisé si fourni
      if (onDelete) {
        onDelete()
      } else {
        // Redirection par défaut
        router.push("/admin/events")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error)
      alert("Échec de la suppression de l'événement. Veuillez vérifier la console pour plus de détails.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            {eventTitle ? (
              <>
                Cette action est irréversible. L'événement <strong>"{eventTitle}"</strong> sera définitivement supprimé ainsi que toutes les inscriptions associées.
              </>
            ) : (
              "Cette action est irréversible. L'événement sera définitivement supprimé ainsi que toutes les inscriptions associées."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Suppression...
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}