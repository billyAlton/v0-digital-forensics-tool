import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Users, Mail, Phone } from "lucide-react"

export default async function VolunteersPage() {
  const supabase = await createClient()

  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("*, profiles(first_name, last_name, email, phone)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-gray-600 mt-2">Manage church volunteers and their assignments</p>
        </div>
        <Button asChild>
          <Link href="/admin/volunteers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Volunteer
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {volunteers?.map((volunteer) => (
          <Card key={volunteer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {volunteer.profiles?.first_name} {volunteer.profiles?.last_name}
                    </h3>
                    <Badge variant={volunteer.status === "active" ? "default" : "secondary"}>{volunteer.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline">{volunteer.department}</Badge>
                </div>
                {volunteer.profiles?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{volunteer.profiles.email}</span>
                  </div>
                )}
                {volunteer.profiles?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{volunteer.profiles.phone}</span>
                  </div>
                )}
              </div>

              {volunteer.skills && volunteer.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {volunteer.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{volunteer.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Button asChild size="sm" className="w-full">
                <Link href={`/admin/volunteers/${volunteer.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!volunteers ||
        (volunteers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No volunteers yet</h3>
              <p className="text-gray-600 mb-4">Start building your volunteer team</p>
              <Button asChild>
                <Link href="/admin/volunteers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Volunteer
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
