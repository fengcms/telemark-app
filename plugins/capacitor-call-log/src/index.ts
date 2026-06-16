import { registerPlugin } from '@capacitor/core';
import type { CallLogPlugin } from './definitions';

const CallLog = registerPlugin<CallLogPlugin>('CallLog');

export * from './definitions';
export { CallLog };
