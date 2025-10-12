import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, DollarSign, Calendar, CreditCard } from "lucide-react"
import { format } from "date-fns"

export default async function DonationsPage() {
  const supabase = await createClient()

  const { data: donations } = await supabase.from("donations").select("*").order("created_at", { ascending: false })

  const totalAmount = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const completedDonations = donations?.filter((d) => d.payment_status === "completed") || []
  const completedAmount = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-600 mt-2">Track and manage church donations</p>
        </div>
        <Button asChild>
          <Link href="/admin/donations/new">
            <Plus className="mr-2 h-4 w-4" />
            Record Donation
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${completedAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{donations?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donations?.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {donation.donor_name || "Anonymous"} - ${Number(donation.amount).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(donation.created_at), "MMM dd, yyyy")}
                      </span>
                      <Badge variant="outline">{donation.donation_type}</Badge>
                      {donation.payment_method && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {donation.payment_method}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      donation.payment_status === "completed"
                        ? "default"
                        : donation.payment_status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {donation.payment_status}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/donations/${donation.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!donations ||
            (donations.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations yet</h3>
                <p className="text-gray-600 mb-4">Start tracking donations</p>
                <Button asChild>
                  <Link href="/admin/donations/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Donation
                  </Link>
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
