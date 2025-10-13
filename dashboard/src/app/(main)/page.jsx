
import Image from "next/image"
import { ModeToggle } from "@/components/modeToggle"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserInfo } from "@/components/user-info"

import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="flex flex-col flex-auto items-center justify-between p-2">
      <h1 className="text-4xl font-bold">Welcome to W! Platform!</h1>
      <Image
        src="/logo.svg"
        alt="W! Logo"
        width={200}
        height={200}
      />
      <p className="mt-1 text-lg">
        This is a simple W! Platform application.
      </p>

      <UserInfo user={session.user} />
      <ModeToggle />

       
    </main>
  )
}
export const metadata = {
  title: "W! Platform",
  description: "A simple W! Platform application using Next.js and NextAuth.js",
}