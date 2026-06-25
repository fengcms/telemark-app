import { App as CapacitorApp } from '@capacitor/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { reportCall } from '@/api/endpoints';
import type { FeedbackSubmitValue } from '@/components/FeedbackSheet';
import {
  getLatestCallForNumber,
  requestCallLogPermission,
} from '@/mobile/callLog';
import { queueCallReport } from '@/offline/callQueue';
import type { ActiveCall, Customer } from '@/types';
import { getErrorMessage } from '@/utils/format';
import { createClientRequestId } from '@/utils/id';

export function useCallFeedback() {
  const queryClient = useQueryClient();
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [feedbackCustomer, setFeedbackCustomer] = useState<Customer | null>(
    null,
  );
  const [duration, setDuration] = useState(0);
  const [durationSource, setDurationSource] = useState<'call-log' | 'missing'>(
    'missing',
  );
  const [startedAt, setStartedAt] = useState<string | undefined>();
  const [endedAt, setEndedAt] = useState<string | undefined>();
  const [message, setMessage] = useState('');

  function closeFeedback() {
    setFeedbackCustomer(null);
    setActiveCall(null);
    setDuration(0);
    setDurationSource('missing');
    setStartedAt(undefined);
    setEndedAt(undefined);
  }

  const reportMutation = useMutation({
    mutationFn: reportCall,
    onSuccess: async () => {
      setMessage('通话结果已提交');
      closeFeedback();
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['history'] });
      await queryClient.invalidateQueries({ queryKey: ['summary'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error, payload) => {
      queueCallReport(payload, {
        customerName: feedbackCustomer?.name,
        phone: feedbackCustomer?.phone,
      });
      setMessage(`网络不可用，已离线保存：${getErrorMessage(error)}`);
      closeFeedback();
    },
  });

  async function handleCall(customer: Customer) {
    const nextStartedAt = new Date().toISOString();
    setMessage('');
    setActiveCall({ customer, startedAt: nextStartedAt });
    await requestCallLogPermission();
    window.location.href = `tel:${customer.phone}`;
  }

  const openFeedbackFromCall = useCallback(async (call: ActiveCall) => {
    const nativeEntry = await getLatestCallForNumber(
      call.customer.phone,
      call.startedAt,
    );

    setFeedbackCustomer(call.customer);
    if (nativeEntry) {
      setStartedAt(nativeEntry.startedAt);
      setEndedAt(nativeEntry.endedAt);
      setDuration(nativeEntry.duration);
      setDurationSource('call-log');
      return;
    }

    setStartedAt(call.startedAt);
    setEndedAt(new Date().toISOString());
    setDuration(0);
    setDurationSource('missing');
  }, []);

  function handleSubmit(value: FeedbackSubmitValue) {
    if (!feedbackCustomer) {
      return;
    }

    reportMutation.mutate({
      customerId: feedbackCustomer.id,
      duration: value.duration,
      callResult: value.callResult,
      callRemark: value.callRemark,
      customerType: value.customerType,
      clientRequestId: createClientRequestId(),
      startedAt,
      endedAt,
    });
  }

  useEffect(() => {
    const setup = async () => {
      const handle = await CapacitorApp.addListener(
        'appStateChange',
        ({ isActive }) => {
          if (isActive && activeCall) {
            void openFeedbackFromCall(activeCall);
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
  }, [activeCall, openFeedbackFromCall]);

  return {
    feedbackSheetProps: {
      customer: feedbackCustomer,
      defaultDuration: duration,
      durationSource,
      onClose: closeFeedback,
      onSubmit: handleSubmit,
      open: Boolean(feedbackCustomer),
      submitting: reportMutation.isPending,
    },
    handleCall,
    message,
  };
}
