import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Edit, Heart, User } from "lucide-react"
import { DeletePrayerRequestButton } from "@/components/delete-prayer-request-button"

export default async function PrayerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prayer } = await supabase.from("prayer_requests").select("*").eq("id", id).single()

  if (!prayer) {
    notFound()
  }

  const { data: interactions } = await supabase
    .from("prayer_interactions")
    .select("*, profiles(first_name, last_name)")
    .eq("prayer_request_id", id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{prayer.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={prayer.status === "active" ? "default" : prayer.status === "answered" ? "secondary" : "outline"}
            >
              {prayer.status}
            </Badge>
            {!prayer.is_public && <Badge variant="outline">Private</Badge>}
            {prayer.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/prayers/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeletePrayerRequestButton prayerId={id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prayer Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{prayer.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Requester</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    {prayer.is_anonymous ? (
                      <span className="italic">Anonymous</span>
                    ) : (
                      <span>{prayer.requester_name}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Submitted</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(prayer.created_at), "PPP")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prayer History ({interactions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {interactions && interactions.length > 0 ? (
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">
                          {interaction.profiles?.first_name} {interaction.profiles?.last_name}
                        </span>
                        <span className="text-sm text-gray-600">prayed</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {format(new Date(interaction.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No one has prayed yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-600">Total Prayers</span>
                </div>
                <span className="text-2xl font-bold">{prayer.prayer_count}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visibility</span>
                <Badge variant={prayer.is_public ? "default" : "secondary"}>
                  {prayer.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Anonymous</span>
                <Badge variant={prayer.is_anonymous ? "default" : "secondary"}>
                  {prayer.is_anonymous ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
