import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <div>
                <h1 className="text-3xl font-bold">Payment Cancelled</h1>
                <p className="text-muted-foreground mt-2">
                  Your payment was cancelled. No charges were made.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4 justify-center">
          <Button asChild>
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

