import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mic, FileText, Heart, DollarSign, Users } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: eventsCount },
    { count: sermonsCount },
    { count: blogCount },
    { count: prayersCount },
    { data: donations },
    { count: volunteersCount },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("sermons").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("donations").select("amount"),
    supabase.from("volunteers").select("*", { count: "exact", head: true }),
  ])

  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0)

  const stats = [
    {
      name: "Total Events",
      value: eventsCount || 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Sermons",
      value: sermonsCount || 0,
      icon: Mic,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "Blog Posts",
      value: blogCount || 0,
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Prayer Requests",
      value: prayersCount || 0,
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      name: "Total Donations",
      value: `$${totalDonations?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      name: "Volunteers",
      value: volunteersCount || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your church management dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
              <div className={cn("rounded-full p-2", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
