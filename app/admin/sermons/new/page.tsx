import { SermonForm } from "@/components/sermon-form"

export default function NewSermonPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Sermon</h1>
        <p className="text-gray-600 mt-2">Upload a new sermon with media files</p>
      </div>
      <SermonForm />
    </div>
  )
}
