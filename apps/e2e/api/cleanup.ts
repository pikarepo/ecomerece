import type { APIRequestContext } from '@playwright/test';

export type CleanupAction = {
  label: string;
  run: () => Promise<void>;
};

export class CleanupRegistry {
  private readonly actions: CleanupAction[] = [];

  add(label: string, run: () => Promise<void>): void {
    this.actions.push({ label, run });
  }

  addRequest(
    label: string,
    api: APIRequestContext,
    method: 'delete' | 'patch' | 'post' | 'put',
    path: string,
    data?: unknown,
    ignoredStatuses: readonly number[] = [404],
  ): void {
    this.add(label, async () => {
      const response =
        method === 'delete'
          ? await api.delete(path, { data })
          : method === 'patch'
            ? await api.patch(path, { data })
            : method === 'post'
              ? await api.post(path, { data })
              : await api.put(path, { data });
      if (!response.ok() && !ignoredStatuses.includes(response.status())) {
        throw new Error(`${label} failed with status ${response.status()}.`);
      }
    });
  }

  async dispose(): Promise<void> {
    const errors: string[] = [];
    for (const action of [...this.actions].reverse()) {
      try {
        await action.run();
      } catch (error) {
        errors.push(`${action.label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    this.actions.length = 0;
    if (errors.length > 0) {
      throw new Error(`Cleanup failed:\n${errors.join('\n')}`);
    }
  }
}
