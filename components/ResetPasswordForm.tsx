"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, KeyRound } from "lucide-react";
import { resetPassword } from "@/app/actions/password-reset";

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword({ password: formData.password }, token);

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Your password has been reset successfully.",
                });
                router.push("/login");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive text-center">Invalid Link</CardTitle>
                    <CardDescription className="text-center">
                        This password reset link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push("/forgot-password")} className="w-full">
                        Request a new link
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-center">Reset password</CardTitle>
                <CardDescription className="text-center">
                    Enter your new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
