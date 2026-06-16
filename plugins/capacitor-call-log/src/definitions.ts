export type CallLogEntry = {
  number: string;
  duration: number;
  startedAt: string;
  endedAt: string;
  type: number;
};

export type CallLogPlugin = {
  requestPermissions: () => Promise<{ granted: boolean }>;
  getLatestForNumber: (options: {
    phone: string;
    since?: string;
  }) => Promise<{ entry: CallLogEntry | null }>;
};
