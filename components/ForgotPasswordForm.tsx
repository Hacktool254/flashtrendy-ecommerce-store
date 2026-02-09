"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { resetPasswordRequest } from "@/app/actions/password-reset";

export function ForgotPasswordForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await resetPasswordRequest({ email });

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                setIsSubmitted(true);
                toast({
                    title: "Success",
                    description: "If an account exists with that email, a reset link has been sent.",
                });
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <MailCheck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-center">Check your email</CardTitle>
                    <CardDescription className="text-center">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/login">Return to login</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Forgot password?</CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <Link href="/login" className="text-primary hover:underline">
                        Back to login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
