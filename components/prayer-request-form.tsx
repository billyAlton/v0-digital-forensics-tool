"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { PrayerRequestService } from "@/src/services/prayer.service"
import { toast } from "sonner"


interface PrayerRequestFormProps {
  prayer?: {
    id: string
    title: string
    description: string
    requester_name: string | null
    status: string
    is_anonymous: boolean
    is_public: boolean
  }
}

export function PrayerRequestForm({ prayer }: PrayerRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: prayer?.title || "",
    description: prayer?.description || "",
    requester_name: prayer?.requester_name || "",
    status: prayer?.status || "active",
    is_anonymous: prayer?.is_anonymous || false,
    is_public: prayer?.is_public !== undefined ? prayer.is_public : true,
  })

  /* const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const prayerData = {
      title: formData.title,
      description: formData.description,
      requester_name: formData.is_anonymous ? null : formData.requester_name || null,
      requester_id: user.id,
      status: formData.status,
      is_anonymous: formData.is_anonymous,
      is_public: formData.is_public,
    }

    try {
      if (prayer) {
        const { error } = await supabase.from("prayer_requests").update(prayerData).eq("id", prayer.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("prayer_requests").insert([prayerData])

        if (error) throw error
      }

      router.push("/admin/prayers")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  } */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  try {
/*     const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      setError("Vous devez être connecté")
      setIsLoading(false)
      return
    } */

    const prayerData = {
      ...formData,
      requester_name: formData.is_anonymous ? null : formData.requester_name || null,
    }

    if (prayer) {
      await PrayerRequestService.updatePrayerRequest(prayer._id, formData)
      toast.success("Demande de prière mise à jour avec succès")
    } else {
      await PrayerRequestService.createPrayerRequest(formData)
      toast.success("Demande de prière créée avec succès")
    }

    router.push("/admin/prayers")
    router.refresh()
  } catch (err: any) {
    setError(err.message || "Une erreur est survenue")
    toast.error("Échec de l'envoi de la demande")
  } finally {
    setIsLoading(false)
  }
}
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Prayer Request Title *</Label>
            <Input
              id="title"
              required
              placeholder="e.g., Healing for family member"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={6}
              required
              placeholder="Describe the prayer request in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requester_name">Requester Name</Label>
              <Input
                id="requester_name"
                placeholder="John Doe"
                value={formData.requester_name}
                onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                disabled={formData.is_anonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_anonymous"
                checked={formData.is_anonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked as boolean })}
              />
              <Label htmlFor="is_anonymous" className="text-sm font-normal cursor-pointer">
                Submit anonymously (hide requester name)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
              />
              <Label htmlFor="is_public" className="text-sm font-normal cursor-pointer">
                Make this prayer request public
              </Label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : prayer ? "Update Prayer Request" : "Create Prayer Request"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
