"use client";

import { handleSignOut } from "@/app/actions/auth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  return (
    <DropdownMenuItem onClick={() => handleSignOut()}>Sign Out</DropdownMenuItem>
  );
}

