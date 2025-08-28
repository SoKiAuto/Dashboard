"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function UserInfo({ user }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center space-x-4 mt-6">
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="text-left">
        <p className="text-lg font-medium">{user.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Role: {user.role}
        </p>
      </div>
      <Button
        variant="outline"
        className="ml-4"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign Out
      </Button>
    </div>
  )
}
