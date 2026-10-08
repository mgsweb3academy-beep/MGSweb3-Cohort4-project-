'use client';

import React, { useEffect, useState } from 'react';
import type { AgentLog } from '@/lib/types';

export function ManagerLogStream() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/ai/manager/logs');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/v1/ai/manager/evaluate', { method: 'POST' });
      if (!res.ok) throw new Error('Evaluation failed');
      await fetchLogs(); // Refresh logs after evaluation
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="card w-full max-w-3xl">
      <div className="flex items-center justify-between mb-4 border-b border-ink-3 pb-4">
        <div>
          <h2 className="font-display font-bold text-[1.2rem] text-chalk">AI Manager Log</h2>
          <p className="text-[.875rem] text-dim">Task Orchestration & Escalation</p>
        </div>
        <button 
          onClick={triggerEvaluation}
          disabled={isEvaluating}
          className="btn btn-outline"
        >
          {isEvaluating ? 'Evaluating...' : 'Trigger Evaluation'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-dim text-[.875rem] animate-pulse">Loading logs...</div>
      ) : error ? (
        <div className="text-mark text-[.875rem]">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-dim text-[.875rem]">No logs recorded yet.</div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-ink-2 rounded-[8px] border border-ink-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-chalk flex items-center gap-2">
                  Manager
                  {log.status === 'proposed' && (
                    <span className="pill pill-yellow text-[0.65rem] px-2 py-0.5">Proposed</span>
                  )}
                  {log.status === 'applied' && (
                    <span className="pill pill-green text-[0.65rem] px-2 py-0.5">Applied</span>
                  )}
                </span>
                <span className="mono text-[.75rem] text-dim">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-dim text-[.9rem]">{log.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
