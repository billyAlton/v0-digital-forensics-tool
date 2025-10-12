import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Edit, Eye, Video, Music, FileText } from "lucide-react"
import { DeleteSermonButton } from "@/components/delete-sermon-button"

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sermon } = await supabase.from("sermons").select("*").eq("id", id).single()

  if (!sermon) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{sermon.title}</h1>
          <p className="text-gray-600 mt-2">by {sermon.pastor_name}</p>
          {sermon.series && <Badge className="mt-2">{sermon.series}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/sermons/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteSermonButton sermonId={id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sermon Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{sermon.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(sermon.sermon_date), "PPP")}
                  </div>
                </div>
                {sermon.scripture_reference && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Scripture Reference</h3>
                    <p className="text-gray-700">{sermon.scripture_reference}</p>
                  </div>
                )}
              </div>
              {sermon.tags && sermon.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {sermon.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {sermon.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <a
                    href={sermon.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Video Link
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {sermon.audio_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={sermon.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open Audio Link
                </a>
              </CardContent>
            </Card>
          )}

          {sermon.transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{sermon.transcript}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <span className="text-2xl font-bold">{sermon.views}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Media Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Video</span>
                </div>
                <Badge variant={sermon.video_url ? "default" : "secondary"}>
                  {sermon.video_url ? "Available" : "Not uploaded"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Audio</span>
                </div>
                <Badge variant={sermon.audio_url ? "default" : "secondary"}>
                  {sermon.audio_url ? "Available" : "Not uploaded"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Transcript</span>
                </div>
                <Badge variant={sermon.transcript ? "default" : "secondary"}>
                  {sermon.transcript ? "Available" : "Not added"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
