import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, MapPin, Users, Edit } from "lucide-react"
import { DeleteEventButton } from "@/components/delete-event-button"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single()

  if (!event) {
    notFound()
  }

  const { data: registrations, count } = await supabase
    .from("event_registrations")
    .select("*, profiles(*)", { count: "exact" })
    .eq("event_id", id)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <Badge className="mt-2">{event.event_type}</Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/events/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteEventButton eventId={id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.start_date), "PPP 'at' p")}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.end_date), "PPP 'at' p")}
                  </div>
                </div>
              </div>
              {event.location && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrations ({count || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {registrations && registrations.length > 0 ? (
                <div className="space-y-2">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {reg.profiles?.first_name} {reg.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">Status: {reg.status}</p>
                      </div>
                      <Badge variant={reg.status === "attended" ? "default" : "secondary"}>{reg.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No registrations yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Registered</span>
                </div>
                <span className="text-2xl font-bold">{count || 0}</span>
              </div>
              {event.max_attendees && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Max Capacity</span>
                  </div>
                  <span className="text-2xl font-bold">{event.max_attendees}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
