import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Esprit et Vie Church</h1>
        <p className="text-xl text-gray-600 mb-8">Welcome to our church management system</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
