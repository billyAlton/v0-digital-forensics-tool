import { PrayerRequestForm } from "@/components/prayer-request-form"

export default function NewPrayerRequestPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Prayer Request</h1>
        <p className="text-gray-600 mt-2">Create a new prayer request</p>
      </div>
      <PrayerRequestForm />
    </div>
  )
}
