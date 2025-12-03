import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";

export async function UserAccountDropdown() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  const userInitials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/orders">My Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">Profile</Link>
        </DropdownMenuItem>
        {session.user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">Admin Panel</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

