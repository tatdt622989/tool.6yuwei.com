// Runs matching off the main thread so a catastrophic-backtracking pattern can be terminated.
import { run, type RunRequest, type RunResponse } from './logic';

self.addEventListener('message', (event: MessageEvent<RunRequest & { id: number }>) => {
  const { id, ...request } = event.data;
  let result: RunResponse;
  try {
    result = run(request);
  } catch (err) {
    result = { ok: false, error: `執行失敗：${(err as Error).message}` };
  }
  self.postMessage({ id, result });
});
