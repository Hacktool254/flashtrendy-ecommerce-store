import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield, User, Globe, Bell } from "lucide-react";

export default async function AdminSettingsPage() {
    const session = await auth();
    const user = session?.user;

    const systemSettings = [
        { label: "Store Name", value: "FlashTrendy Ecommerce", icon: Globe },
        { label: "Admin Email", value: user?.email || "N/A", icon: Mail },
        { label: "Role", value: user?.role || "ADMIN", icon: Shield },
        { label: "Notifications", value: "Email Enabled", icon: Bell },
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your admin profile and system preferences</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            View and manage your administrator account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" defaultValue={user?.name || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" defaultValue={user?.email || ""} disabled />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" disabled>Update Profile</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Configuration</CardTitle>
                        <CardDescription>
                            Overview of your store's current configuration and integrations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemSettings.map((setting, index) => {
                                const Icon = setting.icon;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-full">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-medium">{setting.label}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{setting.value}</span>
                                        </div>
                                        {index < systemSettings.length - 1 && <Separator />}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Integration Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>
                            External services connected to FlashTrendy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Stripe</div>
                                <div className="text-sm text-muted-foreground">Payment gateway for checkout sessions</div>
                            </div>
                            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                Connected
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Resend</div>
                                <div className="text-sm text-muted-foreground">Email delivery for order confirmations</div>
                            </div>
                            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                Connected
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">UploadThing</div>
                                <div className="text-sm text-muted-foreground">Storage for product images and avatars</div>
                            </div>
                            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                Connected
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
