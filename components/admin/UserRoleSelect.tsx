"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserRoleSelectProps {
    userId: string;
    currentRole: "USER" | "ADMIN";
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRoleChange = async (newRole: string) => {
        setIsLoading(true);
        try {
            const result = await updateUserRole(userId, newRole as "USER" | "ADMIN");
            if (result.success) {
                toast({
                    title: "Role updated",
                    description: `User role changed to ${newRole}`,
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Select
                defaultValue={currentRole}
                onValueChange={handleRoleChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
