"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { CheckoutSummary } from "@/components/CheckoutSummary";

const shippingAddressSchema = z.object({
  email: z.string().email("Valid email is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

const checkoutSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(),
  shippingMethod: z.enum(["standard", "express"]),
});

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

interface CheckoutFormProps {
  addresses: Address[];
}

export function CheckoutForm({ addresses }: CheckoutFormProps) {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart, syncWithServer } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Sync cart with server on mount (in case user just logged in)
  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);
  const [useSavedAddress, setUseSavedAddress] = useState(
    addresses.length > 0 && addresses.some((a) => a.isDefault)
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.length > 0 ? (addresses.find((a) => a.isDefault)?.id || addresses[0].id) : ""
  );
  const [formData, setFormData] = useState({
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1;
  // Use standard shipping (free if subtotal > 100, otherwise $10)
  const shippingCost = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shippingCost;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // If user wants to use saved address but none selected
    if (useSavedAddress && addresses.length > 0) {
      if (!selectedAddressId) {
        newErrors.address = "Please select a saved address";
      }
    } 
    // If user wants to enter new address or has no saved addresses
    else if (!useSavedAddress || addresses.length === 0) {
      try {
        shippingAddressSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => {
            newErrors[issue.path[0] as string] = issue.message;
          });
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { items: items.length, useSavedAddress, selectedAddressId, formData });

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate that all items have required fields
    const invalidItems = items.filter(item => !item.name || !item.image || !item.productId);
    if (invalidItems.length > 0) {
      console.error("Invalid cart items:", invalidItems);
      toast({
        title: "Cart error",
        description: "Some items in your cart are missing information. Please refresh the page and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      console.log("Validation failed", errors);
      // Show specific validation errors
      const errorMessages = Object.values(errors).filter(Boolean);
      toast({
        title: "Validation error",
        description: errorMessages.length > 0 
          ? errorMessages.join(", ") 
          : "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("Starting checkout process...");

    try {
      let shippingAddress;

      // Use saved address if selected, otherwise use form data
      if (useSavedAddress && addresses.length > 0 && selectedAddressId) {
        const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
        if (!selectedAddress) {
          throw new Error("Selected address not found");
        }
        // Include email from form (will be overridden by session email in API if logged in)
        shippingAddress = {
          email: formData.email || "", // Required for guest checkout
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        };
      } else {
        // Validate form data is complete (includes email)
        const validatedData = shippingAddressSchema.parse(formData);
        shippingAddress = validatedData;
      }

      // First, create the order
      console.log("Creating order...", {
        itemsCount: items.length,
        shippingAddress,
        total,
      });

      const orderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          subtotal,
          tax,
          shipping: shippingCost,
          total,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || error.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.orderId;

      // Then create Stripe checkout session with order ID
      console.log("Creating Stripe checkout session...", {
        orderId,
        itemsCount: items.length,
        total,
      });

      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          shippingMethod: "standard", // Default to standard shipping
          subtotal,
          tax,
          shipping: shippingCost,
          total,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Checkout session creation failed:", error);
        const errorMessage = error.message || error.error || "Failed to create checkout session";
        console.error("Full error response:", JSON.stringify(error, null, 2));
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Checkout session response:", data);
      
      const { sessionId, url } = data;

      // Stripe checkout URL should always be present
      if (url && typeof url === "string" && url.trim().length > 0) {
        console.log("Redirecting to Stripe Checkout:", url);
        // Direct redirect to Stripe Checkout
        window.location.href = url;
        return;
      }

      // Fallback: Use sessionId to construct URL
      if (sessionId && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
        console.log("Redirecting to Stripe Checkout (constructed):", checkoutUrl);
        window.location.href = checkoutUrl;
        return;
      }

      // If we get here, something went wrong
      console.error("Invalid checkout response:", data);
      throw new Error("Failed to get valid checkout URL from Stripe");
    } catch (error: any) {
      console.error("Checkout error:", error);
      
      // Extract error message from response if available
      let errorMessage = "An error occurred during checkout.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response) {
        // If it's a fetch error, try to get the response
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: "Checkout failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length > 0 && (
              <div className="space-y-2">
                <Label>Use saved address</Label>
                <RadioGroup
                  value={useSavedAddress ? "saved" : "new"}
                  onValueChange={(value) => {
                    setUseSavedAddress(value === "saved");
                    setErrors({});
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saved" id="saved" />
                    <Label htmlFor="saved" className="font-normal cursor-pointer">
                      Use saved address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="font-normal cursor-pointer">
                      Enter new address
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {useSavedAddress && addresses.length > 0 ? (
              <div className="space-y-2">
                <Label>Select Address</Label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => {
                    setSelectedAddressId(e.target.value);
                    setErrors({});
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select an address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                      {address.isDefault && " (Default)"}
                    </option>
                  ))}
                </select>
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="123 Main St"
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="10001"
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-destructive">{errors.zipCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="US"
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <Button
              type="submit"
              form="checkout-form"
              className="w-full mt-6"
              size="lg"
              disabled={isLoading || items.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating an order...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <CheckoutSummary
          subtotal={subtotal}
          tax={tax}
          shipping={shippingCost}
          total={total}
          itemCount={getTotalItems()}
          isLoading={isLoading}
          items={items}
        />
      </div>
    </form>
  );
}

