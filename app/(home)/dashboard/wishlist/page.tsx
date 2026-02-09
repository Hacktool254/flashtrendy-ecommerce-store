import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login?redirect=/dashboard/wishlist");
    }

    const wishlistItems = await prisma.wishlist.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            product: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Wishlist</h1>
                <p className="text-muted-foreground">Items you&apos;ve saved for later</p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                        <ProductCard
                            key={item.product.id}
                            id={item.product.id}
                            name={item.product.name}
                            price={Number(item.product.price)}
                            images={item.product.images}
                            stock={item.product.stock}
                            isWishlisted={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
