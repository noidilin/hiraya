import { useQuery } from "@tanstack/react-query";

import { listMyOrders } from "@/api";
import { useAuth } from "@/hooks/use-auth";

export function useOrderHistoryQuery() {
  const { user, status } = useAuth();

  const query = useQuery({
    enabled: status === "authenticated" && Boolean(user),
    queryKey: ["orders", "my-orders", user?.id],
    queryFn: () => listMyOrders(user?.id),
    retry: false,
  });

  return {
    ...query,
    orders: query.data ?? [],
    isAuthenticated: status === "authenticated" && Boolean(user),
    isAuthLoading: status === "idle" || status === "loading",
  };
}
