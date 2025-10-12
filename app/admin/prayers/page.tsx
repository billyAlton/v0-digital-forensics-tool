import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Heart, Calendar, User } from "lucide-react"
import { format } from "date-fns"

export default async function PrayersPage() {
  const supabase = await createClient()

  const { data: prayers } = await supabase.from("prayer_requests").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-gray-600 mt-2">Manage and respond to prayer requests</p>
        </div>
        <Button asChild>
          <Link href="/admin/prayers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Prayer Request
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prayers?.map((prayer) => (
          <Card key={prayer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{prayer.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    {prayer.is_anonymous ? (
                      <span className="italic">Anonymous</span>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span>{prayer.requester_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    prayer.status === "active" ? "default" : prayer.status === "answered" ? "secondary" : "outline"
                  }
                >
                  {prayer.status}
                </Badge>
              </div>

              <p className="text-gray-700 line-clamp-3 mb-4">{prayer.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{prayer.prayer_count} prayers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(prayer.created_at), "MMM dd")}</span>
                  </div>
                  {!prayer.is_public && <Badge variant="outline">Private</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/prayers/${prayer.id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/admin/prayers/${prayer.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!prayers ||
        (prayers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prayer requests yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first prayer request</p>
              <Button asChild>
                <Link href="/admin/prayers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prayer Request
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
