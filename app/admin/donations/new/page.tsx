import { DonationForm } from "@/components/donation-form"

export default function NewDonationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Record Donation</h1>
        <p className="text-gray-600 mt-2">Add a new donation record</p>
      </div>
      <DonationForm />
    </div>
  )
}
