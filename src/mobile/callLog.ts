import { Capacitor, registerPlugin } from '@capacitor/core';
import { normalizePhone } from '@/utils/format';

export type NativeCallLogEntry = {
  number: string;
  duration: number;
  startedAt: string;
  endedAt: string;
  type: number;
};

type CallLogPlugin = {
  requestPermissions: () => Promise<{ granted: boolean }>;
  getLatestForNumber: (options: {
    phone: string;
    since?: string;
  }) => Promise<{ entry: NativeCallLogEntry | null }>;
};

const NativeCallLog = registerPlugin<CallLogPlugin>('CallLog');

export async function requestCallLogPermission() {
  if (Capacitor.getPlatform() !== 'android') {
    return false;
  }

  try {
    const result = await NativeCallLog.requestPermissions();
    return result.granted;
  } catch {
    return false;
  }
}

export async function getLatestCallForNumber(phone: string, since?: string) {
  if (Capacitor.getPlatform() !== 'android') {
    return null;
  }

  try {
    const result = await NativeCallLog.getLatestForNumber({
      phone: normalizePhone(phone),
      since,
    });
    return result.entry;
  } catch {
    return null;
  }
}
