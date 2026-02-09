"use client";

import { Address } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MoreVertical, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { deleteAddress, setDefaultAddress } from "@/app/actions/address";
import { useToast } from "@/hooks/use-toast";
import { AddressForm } from "./AddressForm";

interface AddressCardProps {
    address: Address;
}

export function AddressCard({ address }: AddressCardProps) {
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSettingDefault, setIsSettingDefault] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAddress(address.id);
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Address deleted successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete address",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async () => {
        setIsSettingDefault(true);
        try {
            const result = await setDefaultAddress(address.id);
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Default address updated",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update default address",
                variant: "destructive",
            });
        } finally {
            setIsSettingDefault(false);
        }
    };

    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            {address.city}, {address.state}
                            {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                    Default
                                </Badge>
                            )}
                        </CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {!address.isDefault && (
                                <DropdownMenuItem onClick={handleSetDefault} disabled={isSettingDefault}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Set as Default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>{address.street}</p>
                    <p>
                        {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                </div>
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                        <DialogDescription>
                            Make changes to your address details below.
                        </DialogDescription>
                    </DialogHeader>
                    <AddressForm
                        address={address}
                        onSuccess={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
