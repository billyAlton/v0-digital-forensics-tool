import { createClient } from "@/lib/supabase/server"
import { SermonForm } from "@/components/sermon-form"
import { notFound } from "next/navigation"

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sermon } = await supabase.from("sermons").select("*").eq("id", id).single()

  if (!sermon) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Sermon</h1>
        <p className="text-gray-600 mt-2">Update sermon details and media</p>
      </div>
      <SermonForm sermon={sermon} />
    </div>
  )
}
