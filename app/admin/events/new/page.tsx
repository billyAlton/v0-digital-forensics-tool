import { EventForm } from "@/components/event-form"

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">Add a new event to the calendar</p>
      </div>
      <EventForm />
    </div>
  )
}
