"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function handleSignIn(email: string, password: string, redirectTo?: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid email or password" };
    }

    if (result?.ok) {
      redirect(redirectTo || "/dashboard");
    }

    return { error: "Sign in failed" };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "An error occurred during sign in" };
  }
}

