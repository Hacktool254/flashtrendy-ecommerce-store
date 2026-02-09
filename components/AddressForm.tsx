"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addAddress, updateAddress } from "@/app/actions/address";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Address } from "@prisma/client";

interface AddressFormProps {
    address?: Address;
    onSuccess?: () => void;
}

export function AddressForm({ address, onSuccess }: AddressFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AddressInput>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            street: address?.street || "",
            city: address?.city || "",
            state: address?.state || "",
            zipCode: address?.zipCode || "",
            country: address?.country || "US",
            isDefault: address?.isDefault || false,
        },
    });

    const onSubmit = async (data: AddressInput) => {
        setIsLoading(true);
        try {
            let result;
            if (address) {
                result = await updateAddress(address.id, data);
            } else {
                result = await addAddress(data);
            }

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `Address ${address ? "updated" : "added"} successfully`,
                });
                form.reset();
                onSuccess?.();
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" {...form.register("street")} placeholder="123 Main St" />
                {form.formState.errors.street && (
                    <p className="text-sm text-destructive">{form.formState.errors.street.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...form.register("city")} placeholder="New York" />
                    {form.formState.errors.city && (
                        <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...form.register("state")} placeholder="NY" />
                    {form.formState.errors.state && (
                        <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...form.register("zipCode")} placeholder="10001" />
                    {form.formState.errors.zipCode && (
                        <p className="text-sm text-destructive">{form.formState.errors.zipCode.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...form.register("country")} placeholder="US" />
                    {form.formState.errors.country && (
                        <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isDefault"
                    checked={form.watch("isDefault")}
                    onCheckedChange={(checked) => form.setValue("isDefault", checked as boolean)}
                />
                <Label htmlFor="isDefault">Set as default address</Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {address ? "Update Address" : "Add Address"}
            </Button>
        </form>
    );
}
