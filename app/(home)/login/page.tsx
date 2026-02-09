import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";

type SearchParams = Promise<{
  redirect?: string;
}>;

interface LoginPageProps {
  searchParams: SearchParams;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;

  // If already logged in, redirect to dashboard or the redirect URL
  if (session?.user) {
    const redirectTo = params.redirect || "/dashboard";
    redirect(redirectTo);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm redirectTo={params.redirect} />
      </div>
    </div>
  );
}

