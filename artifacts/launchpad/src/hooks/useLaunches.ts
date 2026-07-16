import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLaunches,
  addLaunch,
  getLaunchById,
  setLaunchVerified,
  type CreateLaunch,
} from "@/lib/launches";

export const LAUNCHES_KEY = ["launches"] as const;

/** All launches, newest first. Shared cache across the app. */
export function useLaunches() {
  return useQuery({
    queryKey: LAUNCHES_KEY,
    queryFn: getLaunches,
    staleTime: 30_000,
  });
}

/** Single launch by ID. */
export function useLaunchById(id: string | undefined) {
  return useQuery({
    queryKey: [...LAUNCHES_KEY, id],
    queryFn: () => getLaunchById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** Create a new launch and invalidate the list cache. */
export function useAddLaunch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (launch: CreateLaunch) => addLaunch(launch),
    onSuccess: () => qc.invalidateQueries({ queryKey: LAUNCHES_KEY }),
  });
}

/** Toggle a launch's verified status and invalidate the list cache. */
export function useSetVerified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      setLaunchVerified(id, verified),
    onSuccess: () => qc.invalidateQueries({ queryKey: LAUNCHES_KEY }),
  });
}
