// Runs matching off the main thread so a catastrophic-backtracking pattern can be terminated.
import { formatMessage, run, ZH_MESSAGES, type RunRequest, type RunResponse } from './logic';

self.addEventListener('message', (event: MessageEvent<RunRequest & { id: number }>) => {
  const { id, ...request } = event.data;
  let result: RunResponse;
  try {
    result = run(request);
  } catch (err) {
    result = { ok: false, error: formatMessage((request.messages ?? ZH_MESSAGES).failed, { message: (err as Error).message }) };
  }
  self.postMessage({ id, result });
});
