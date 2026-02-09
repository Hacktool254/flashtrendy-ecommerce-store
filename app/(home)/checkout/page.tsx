import { auth } from "@/auth";
import { CheckoutForm } from "@/components/CheckoutForm";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const session = await auth();

  // Fetch user's saved addresses if logged in, otherwise empty array
  const addresses = session?.user
    ? await prisma.address.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" },
        ],
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm addresses={addresses} />
      </div>
    </div>
  );
}

