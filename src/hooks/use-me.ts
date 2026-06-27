import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/auth.functions";

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: () => getMe(),
  staleTime: 60_000,
});

export function useMe() {
  return useSuspenseQuery(meQueryOptions);
}