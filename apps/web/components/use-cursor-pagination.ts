'use client';

import { useState } from 'react';

export function useCursorPagination(limit = 12) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<(string | undefined)[]>([]);

  const next = (nextCursor: string | null | undefined) => {
    if (!nextCursor) return;
    setHistory((current) => [...current, cursor]);
    setCursor(nextCursor);
  };

  const previous = () => {
    if (history.length === 0) return;
    const nextHistory = [...history];
    const previousCursor = nextHistory.pop();
    setHistory(nextHistory);
    setCursor(previousCursor);
  };

  const reset = () => {
    setCursor(undefined);
    setHistory([]);
  };

  return {
    cursor,
    limit,
    next,
    previous,
    reset,
    hasPrevious: history.length > 0,
  };
}
