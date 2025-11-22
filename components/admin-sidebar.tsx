"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Mic, FileText, Heart, DollarSign, Users, Mail, LogOut, Speaker , PictureInPictureIcon , Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Sermons", href: "/admin/sermons", icon: Mic },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Prayer Requests", href: "/admin/prayers", icon: Heart },
  { name: "Donations", href: "/admin/donations", icon: DollarSign },
  { name: "Volunteers", href: "/admin/volunteers", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Ressources", href: "/admin/resources", icon: Mail },
  { name: "Gallery", href: "/admin/gallery", icon: Mail },
  { name: "Temoignages", href: "/admin/testimonies", icon: Mail },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Church Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
