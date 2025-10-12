import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Calendar, User } from "lucide-react"
import { format } from "date-fns"

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600 mt-2">View and manage contact form submissions</p>
      </div>

      <div className="grid gap-6">
        {messages?.map((message) => (
          <Card key={message.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{message.subject}</h3>
                    <Badge
                      variant={
                        message.status === "new"
                          ? "default"
                          : message.status === "read"
                            ? "secondary"
                            : message.status === "replied"
                              ? "outline"
                              : "outline"
                      }
                    >
                      {message.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{message.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{message.email}</span>
                    </div>
                    {message.phone && <span>Phone: {message.phone}</span>}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(message.created_at), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 line-clamp-2 mb-4">{message.message}</p>

              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/messages/${message.id}`}>View Full Message</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!messages ||
        (messages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Contact form submissions will appear here</p>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
