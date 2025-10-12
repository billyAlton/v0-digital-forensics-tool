import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Calendar, Users, Heart, Gift, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  const { data: member } = await supabase.from("user_profiles").select("*").eq("id", params.id).single()

  if (!member) {
    notFound()
  }

  // Get member's activities
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("donor_id", params.id)
    .order("donation_date", { ascending: false })

  const { data: prayers } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("requester_id", params.id)
    .order("created_at", { ascending: false })

  const { data: eventRegistrations } = await supabase
    .from("event_registrations")
    .select("*, events(*)")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })

  const { data: volunteerRoles } = await supabase.from("volunteers").select("*").eq("user_id", params.id)

  const totalDonations = donations?.reduce((sum, d) => sum + Number.parseFloat(d.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">{member.full_name || "Member Profile"}</h1>
            <p className="text-muted-foreground">Member details and activity</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/members/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Member
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            {member.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{member.phone}</p>
                </div>
              </div>
            )}
            {member.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{member.address}</p>
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant={
                  member.membership_status === "active"
                    ? "default"
                    : member.membership_status === "pending"
                      ? "secondary"
                      : "outline"
                }
              >
                {member.membership_status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <Badge variant="outline">{member.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalDonations.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{donations?.length || 0} donations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prayer Requests</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prayers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Registrations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventRegistrations?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Events attended</p>
              </CardContent>
            </Card>
          </div>

          {volunteerRoles && volunteerRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volunteerRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{role.department}</p>
                        <p className="text-sm text-muted-foreground">{role.skills}</p>
                      </div>
                      <Badge variant={role.status === "active" ? "default" : "secondary"}>{role.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">${donation.amount}</p>
                        <p className="text-sm text-muted-foreground">{donation.purpose || "General Fund"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(donation.donation_date).toLocaleDateString()}</p>
                        <Badge variant="outline">{donation.payment_method}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No donations recorded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Event Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {eventRegistrations && eventRegistrations.length > 0 ? (
                <div className="space-y-3">
                  {eventRegistrations.slice(0, 5).map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{reg.events?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {reg.events?.event_date ? new Date(reg.events.event_date).toLocaleDateString() : "Date TBD"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          reg.status === "confirmed" ? "default" : reg.status === "attended" ? "default" : "secondary"
                        }
                      >
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No event registrations</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
