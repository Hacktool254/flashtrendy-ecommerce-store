import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, User, MapPin, Heart } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch stats
  const [orderCount, addressCount, wishlistCount] = await Promise.all([
    prisma.order.count({
      where: { userId: session.user.id },
    }),
    prisma.address.count({
      where: { userId: session.user.id },
    }),
    prisma.wishlist.count({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name || "User"}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orderCount}</p>
            <p className="text-sm text-muted-foreground mb-4">Total orders</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{addressCount}</p>
            <p className="text-sm text-muted-foreground mb-4">Saved addresses</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/addresses">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" />
              Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{wishlistCount}</p>
            <p className="text-sm text-muted-foreground mb-4">Saved items</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account settings and preferences
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">View Cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
