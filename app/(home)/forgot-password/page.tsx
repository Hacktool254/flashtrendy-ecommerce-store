import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
