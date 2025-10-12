import { createClient } from "@/lib/supabase/server"
import { PrayerRequestForm } from "@/components/prayer-request-form"
import { notFound } from "next/navigation"

export default async function EditPrayerRequestPage({
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Prayer Request</h1>
        <p className="text-gray-600 mt-2">Update prayer request details</p>
      </div>
      <PrayerRequestForm prayer={prayer} />
    </div>
  )
}
