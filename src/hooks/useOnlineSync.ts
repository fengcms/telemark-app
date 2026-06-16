import { Network } from '@capacitor/network';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { flushPendingReports } from '@/offline/callQueue';

export function useOnlineSync() {
  const queryClient = useQueryClient();

  const flushMutation = useMutation({
    mutationFn: flushPendingReports,
    onSuccess: (result) => {
      if (result.sent > 0) {
        void queryClient.invalidateQueries({ queryKey: ['customers'] });
        void queryClient.invalidateQueries({ queryKey: ['history'] });
        void queryClient.invalidateQueries({ queryKey: ['summary'] });
      }
    },
  });

  useEffect(() => {
    void flushMutation.mutateAsync();

    const setup = async () => {
      const handle = await Network.addListener(
        'networkStatusChange',
        (status) => {
          if (status.connected) {
            void flushMutation.mutateAsync();
          }
        },
      );

      return handle;
    };

    let cleanup: (() => void) | undefined;
    void setup().then((handle) => {
      cleanup = () => {
        void handle.remove();
      };
    });

    return () => cleanup?.();
  }, [flushMutation.mutateAsync]);

  return flushMutation;
}
