import { createClient } from "@/lib/supabase/server"
import { EventForm } from "@/components/event-form"
import { notFound } from "next/navigation"

export default async function EditEventPage({
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">Update event details</p>
      </div>
      <EventForm event={event} />
    </div>
  )
}
