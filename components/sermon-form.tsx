"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface SermonFormProps {
  sermon?: {
    id: string
    title: string
    description: string | null
    pastor_name: string
    sermon_date: string
    scripture_reference: string | null
    video_url: string | null
    audio_url: string | null
    transcript: string | null
    series: string | null
    tags: string[] | null
  }
}

export function SermonForm({ sermon }: SermonFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: sermon?.title || "",
    description: sermon?.description || "",
    pastor_name: sermon?.pastor_name || "",
    sermon_date: sermon?.sermon_date || new Date().toISOString().split("T")[0],
    scripture_reference: sermon?.scripture_reference || "",
    video_url: sermon?.video_url || "",
    audio_url: sermon?.audio_url || "",
    transcript: sermon?.transcript || "",
    series: sermon?.series || "",
    tags: sermon?.tags?.join(", ") || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
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

    const sermonData = {
      title: formData.title,
      description: formData.description || null,
      pastor_name: formData.pastor_name,
      sermon_date: formData.sermon_date,
      scripture_reference: formData.scripture_reference || null,
      video_url: formData.video_url || null,
      audio_url: formData.audio_url || null,
      transcript: formData.transcript || null,
      series: formData.series || null,
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : null,
      created_by: user.id,
    }

    try {
      if (sermon) {
        const { error } = await supabase.from("sermons").update(sermonData).eq("id", sermon.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("sermons").insert([sermonData])

        if (error) throw error
      }

      router.push("/admin/sermons")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Sermon Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastor_name">Pastor Name *</Label>
              <Input
                id="pastor_name"
                required
                value={formData.pastor_name}
                onChange={(e) => setFormData({ ...formData, pastor_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sermon_date">Sermon Date *</Label>
              <Input
                id="sermon_date"
                type="date"
                required
                value={formData.sermon_date}
                onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scripture_reference">Scripture Reference</Label>
              <Input
                id="scripture_reference"
                placeholder="e.g., John 3:16-17"
                value={formData.scripture_reference}
                onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="series">Series</Label>
              <Input
                id="series"
                placeholder="e.g., Faith Series"
                value={formData.series}
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., faith, prayer, worship"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media Files</h3>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio_url">Audio URL</Label>
              <Input
                id="audio_url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                rows={6}
                placeholder="Enter the sermon transcript here..."
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : sermon ? "Update Sermon" : "Create Sermon"}
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
