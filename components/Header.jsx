"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header({ userName, userAvatar }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="flex items-center justify-end h-16 px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">{userName}</span>
        <Avatar className="size-10 bg-amber-200">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt={userName} />
          ) : null}
          <AvatarFallback className="bg-amber-200 text-amber-800 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
