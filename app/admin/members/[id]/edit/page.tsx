import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import MemberForm from "@/components/member-form"

export default async function EditMemberPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  const { data: member } = await supabase.from("user_profiles").select("*").eq("id", params.id).single()

  if (!member) {
    notFound()
  }

  async function updateMember(formData: FormData) {
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

    const { error } = await supabase.from("user_profiles").update(memberData).eq("id", params.id)

    if (error) {
      console.error("Error updating member:", error)
      return
    }

    redirect(`/admin/members/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/members/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Edit Member</h1>
          <p className="text-muted-foreground">Update member information</p>
        </div>
      </div>

      <MemberForm action={updateMember} initialData={member} />
    </div>
  )
}
