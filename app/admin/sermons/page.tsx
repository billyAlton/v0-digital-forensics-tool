import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Mic, Calendar, Eye, Video, Music } from "lucide-react"
import { format } from "date-fns"
import { DeleteSermonButton } from "@/components/delete-sermon-button"

export default async function SermonsPage() {
  const supabase = await createClient()

  const { data: sermons } = await supabase.from("sermons").select("*").order("sermon_date", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sermons</h1>
          <p className="text-gray-600 mt-2">Manage sermon recordings and transcripts</p>
        </div>
        <Button asChild>
          <Link href="/admin/sermons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Sermon
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {sermons?.map((sermon) => (
          <Card key={sermon.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <Mic className="h-12 w-12 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{sermon.title}</h3>
                      <p className="text-gray-600 mt-1">by {sermon.pastor_name}</p>
                      {sermon.series && (
                        <Badge className="mt-2" variant="secondary">
                          {sermon.series}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/sermons/${sermon.id}`}>View</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/admin/sermons/${sermon.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteSermonButton sermonId={sermon.id} size="sm" />
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 line-clamp-2">{sermon.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(sermon.sermon_date), "MMM dd, yyyy")}
                    </div>
                    {sermon.scripture_reference && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Scripture:</span>
                        {sermon.scripture_reference}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {sermon.views} views
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {sermon.video_url && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Video
                      </Badge>
                    )}
                    {sermon.audio_url && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        Audio
                      </Badge>
                    )}
                    {sermon.transcript && <Badge variant="outline">Transcript</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!sermons ||
        (sermons.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mic className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sermons yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first sermon</p>
              <Button asChild>
                <Link href="/admin/sermons/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sermon
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
