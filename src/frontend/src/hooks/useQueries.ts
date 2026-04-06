import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, CartItem } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return { items: [] };
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItems: CartItem[]) => {
      if (!actor) throw new Error("No actor");
      await actor.addItemsToCart(newItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.removeItemFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
