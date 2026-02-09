"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "id">) => Promise<{ success: boolean; error?: string; status?: number }>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.productId === item.productId);

        if (existingItem) {
          // Update quantity if item already exists
          await get().updateQuantity(item.productId, existingItem.quantity + item.quantity);
          return { success: true };
        } else {
          // Add new item - first add to local state, then sync with server if authenticated
          const newItem = {
            id: `temp-${Date.now()}-${Math.random()}`,
            ...item,
          };

          set((state) => ({
            items: [...state.items, newItem],
          }));

          // Try to sync with server (will fail silently if not authenticated)
          try {
            const response = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              // Update with real ID from server
              set((state) => ({
                items: state.items.map((i) =>
                  i.id === newItem.id ? { ...i, id: data.id } : i
                ),
              }));
            }
            // If not authenticated (401), item stays in localStorage only
          } catch (error) {
            // Silently fail - item is already in localStorage
            console.log("Cart item saved locally (not authenticated)");
          }

          return { success: true };
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        // Update local state first
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));

        // Try to sync with server (will fail silently if not authenticated)
        try {
          const response = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              quantity,
            }),
          });

          // If not authenticated, local state is already updated
          if (!response.ok && response.status !== 401) {
            // Revert on error (except auth errors)
            const currentItems = get().items;
            const item = currentItems.find((i) => i.productId === productId);
            if (item) {
              // Could revert here if needed, but for now we keep the local change
            }
          }
        } catch (error) {
          // Silently fail - local state is already updated
          console.log("Cart updated locally (not authenticated)");
        }
      },

      removeItem: async (productId: string) => {
        // Remove from local state first
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));

        // Try to sync with server (will fail silently if not authenticated)
        try {
          await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } catch (error) {
          // Silently fail - item is already removed from local state
          console.log("Cart item removed locally (not authenticated)");
        }
      },

      clearCart: async () => {
        // Always clear local state first (Zustand)
        set({ items: [] });

        // Try to sync with server (will fail silently if not authenticated)
        try {
          await fetch("/api/cart", {
            method: "DELETE",
          });
        } catch (error) {
          // Silently fail - cart is already cleared locally
          console.log("Cart cleared locally (not authenticated)");
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      syncWithServer: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const data = await response.json();
            // Merge server items with local items (local items take precedence - they're the source of truth)
            const serverItems = data.items || [];
            const localItems = get().items;
            
            // Create a map of local items by productId (local items are the source of truth)
            const localMap = new Map(localItems.map((item) => [item.productId, item]));
            
            // Start with local items (they take precedence)
            const mergedItems = [...localItems];
            
            // Add any server items that aren't in local (to get items added from another device)
            serverItems.forEach((serverItem: CartItem) => {
              if (!localMap.has(serverItem.productId)) {
                mergedItems.push(serverItem);
              }
            });
            
            // Always save to Zustand/localStorage
            set({ items: mergedItems, isLoading: false });
          } else if (response.status === 401) {
            // Not authenticated - keep local items (already saved in Zustand)
            set({ isLoading: false });
          } else {
            // Error - keep local items (already saved in Zustand)
            set({ isLoading: false });
          }
        } catch (error) {
          // Network error - keep local items (already saved in Zustand)
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Ensure items are always saved immediately
      skipHydration: false,
    }
  )
);

