import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, DollarSign, CreditCard, User, FileText } from "lucide-react"

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: donation } = await supabase.from("donations").select("*").eq("id", id).single()

  if (!donation) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donation Details</h1>
          <Badge className="mt-2" variant={donation.payment_status === "completed" ? "default" : "secondary"}>
            {donation.payment_status}
          </Badge>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/donations">Back to Donations</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Donation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Amount</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${Number(donation.amount).toFixed(2)} {donation.currency}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span>Type</span>
                  </div>
                  <Badge variant="outline" className="text-base">
                    {donation.donation_type}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span>Donor Name</span>
                  </div>
                  <p className="font-medium">{donation.donor_name || "Anonymous"}</p>
                </div>
                {donation.donor_email && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <p className="font-medium">{donation.donor_email}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {donation.payment_method && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span>Payment Method</span>
                    </div>
                    <p className="font-medium capitalize">{donation.payment_method}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                  </div>
                  <p className="font-medium">{format(new Date(donation.created_at), "PPP")}</p>
                </div>
              </div>

              {donation.notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Notes</div>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{donation.notes}</p>
                </div>
              )}

              {donation.stripe_payment_id && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Stripe Payment ID</div>
                  <p className="font-mono text-sm">{donation.stripe_payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                <Badge
                  variant={
                    donation.payment_status === "completed"
                      ? "default"
                      : donation.payment_status === "pending"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-base"
                >
                  {donation.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Recurring</p>
                <Badge variant={donation.is_recurring ? "default" : "outline"}>
                  {donation.is_recurring ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
