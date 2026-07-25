import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLiveStreamSettings,
  updateLiveStreamSettings,
  type UpdateLiveStreamSettings,
} from "@/lib/liveStream";

export const LIVE_STREAM_KEY = ["live-stream"] as const;

export function useLiveStream() {
  return useQuery({
    queryKey: LIVE_STREAM_KEY,
    queryFn: getLiveStreamSettings,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateLiveStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: UpdateLiveStreamSettings) =>
      updateLiveStreamSettings(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(LIVE_STREAM_KEY, settings);
    },
  });
}