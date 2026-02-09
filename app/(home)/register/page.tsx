import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";

type SearchParams = Promise<{
  redirect?: string;
}>;

interface RegisterPageProps {
  searchParams: SearchParams;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
        <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>
        <RegisterForm redirectTo={params.redirect} />
      </div>
    </div>
  );
}

