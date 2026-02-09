import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddressCard } from "@/components/AddressCard";
import { AddressForm } from "@/components/AddressForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default async function AddressesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login?redirect=/dashboard/addresses");
    }

    const addresses = await prisma.address.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" },
        ],
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Saved Addresses</h1>
                    <p className="text-muted-foreground">Manage your shipping addresses</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                            <DialogDescription>
                                Add a new shipping address to your account.
                            </DialogDescription>
                        </DialogHeader>
                        <AddressForm />
                    </DialogContent>
                </Dialog>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground mb-4">You haven&apos;t saved any addresses yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {addresses.map((address) => (
                        <AddressCard key={address.id} address={address} />
                    ))}
                </div>
            )}
        </div>
    );
}
