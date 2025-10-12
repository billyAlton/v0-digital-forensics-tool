import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import MemberForm from "@/components/member-form"

export default function NewMemberPage() {
  async function createMember(formData: FormData) {
    "use server"

    const supabase = await createServerClient()

    const memberData = {
      email: formData.get("email") as string,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      membership_status: formData.get("membership_status") as string,
      role: formData.get("role") as string,
    }

    const { error } = await supabase.from("user_profiles").insert(memberData)

    if (error) {
      console.error("Error creating member:", error)
      return
    }

    redirect("/admin/members")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Add New Member</h1>
          <p className="text-muted-foreground">Create a new member profile</p>
        </div>
      </div>

      <MemberForm action={createMember} />
    </div>
  )
}
