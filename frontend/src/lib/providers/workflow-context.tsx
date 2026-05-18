"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { startWorkflow, fetchWorkflowState } from "@/services/api";
import type { WorkflowState } from "@/types/workflow";

interface WorkflowContextValue {
  workflow: WorkflowState | null;
  workflowId: string | null;
  planId: string | null;
  loading: boolean;
  error: string | null;
  refreshWorkflow: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextValue>({
  workflow: null,
  workflowId: null,
  planId: null,
  loading: true,
  error: null,
  refreshWorkflow: async () => {},
});

export function useWorkflow() {
  return useContext(WorkflowContext);
}

const LS_KEY = "lastActiveWorkflowId";

/**
 * Resolve the active workflow using the priority chain:
 * 1. URL query param `?workflow=wf_xxx`
 * 2. localStorage `lastActiveWorkflowId`
 * 3. Bootstrap a new workflow
 */
export function WorkflowProvider({ children, role }: { children: React.ReactNode; role?: string }) {
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  const resolveWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Priority 1: URL query param
      const params = new URLSearchParams(window.location.search);
      const urlWorkflowId = params.get("workflow");

      if (urlWorkflowId) {
        const state = await fetchWorkflowState(urlWorkflowId);
        if (state && state.workflow_id) {
          setWorkflow(state);
          localStorage.setItem(LS_KEY, state.workflow_id);
          return;
        }
      }

      // Priority 2: localStorage backup
      const storedId = localStorage.getItem(LS_KEY);
      if (storedId) {
        const state = await fetchWorkflowState(storedId);
        if (state && state.workflow_id) {
          setWorkflow(state);
          // Update URL for deep-linking without navigation
          const url = new URL(window.location.href);
          url.searchParams.set("workflow", state.workflow_id);
          window.history.replaceState({}, "", url.toString());
          return;
        }
      }

      // Priority 3: Bootstrap new workflow
      const newState = await startWorkflow({
        crop: "wheat",
        product: "Tilt 250 EC",
        objective: "lead_generation",
        week_start_date: "2026-02-16",
        geography: { state: "Uttar Pradesh", district: "Kanpur Nagar" },
        audience: { languages: ["Hindi"], device_types: ["smartphone"] },
        channel_preferences: ["whatsapp", "sms", "field_rep"],
        constraints: { low_bandwidth: true, human_review_required: true, min_stock_cover_days: 10 },
        role: role || "campaign_manager",
      });

      if (newState && newState.workflow_id) {
        setWorkflow(newState);
        localStorage.setItem(LS_KEY, newState.workflow_id);
        // Update URL for deep-linking
        const url = new URL(window.location.href);
        url.searchParams.set("workflow", newState.workflow_id);
        window.history.replaceState({}, "", url.toString());
      } else {
        setWorkflow(newState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workflow initialization failed");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      resolveWorkflow();
    }
  }, [resolveWorkflow]);

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        workflowId: workflow?.workflow_id || null,
        planId: workflow?.plan_id || null,
        loading,
        error,
        refreshWorkflow: resolveWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}
