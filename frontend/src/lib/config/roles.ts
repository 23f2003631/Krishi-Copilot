export type RoleType = "Campaign Manager" | "Territory Manager" | "Field Representative" | "Retailer Support";

export interface RoleConfig {
  id: RoleType;
  label: string;
  description: string;
  demoScenario: string;
  primaryAction: string;
  analyticsFocus: string;
  explainabilityFocus: "engagement" | "weather" | "visit" | "stock";
  kpiPriorities: string[];
  emptyStates: {
    actions: string;
    recommendations: string;
    campaigns: string;
  };
}

export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  "Campaign Manager": {
    id: "Campaign Manager",
    label: "Campaign Manager",
    description: "Central planning and performance overview",
    demoScenario: "Approve wheat fungicide awareness campaign.",
    primaryAction: "Approve Campaign",
    analyticsFocus: "Campaign Lift & Performance",
    explainabilityFocus: "engagement",
    kpiPriorities: ["Expected Campaign Lift", "Approval Queue", "Conversion Forecast", "Segment Reach"],
    emptyStates: {
      actions: "No pending campaign actions required today.",
      recommendations: "No new campaign strategies recommended.",
      campaigns: "No campaigns awaiting approval.",
    }
  },
  "Territory Manager": {
    id: "Territory Manager",
    label: "Territory Manager",
    description: "Regional execution and field readiness",
    demoScenario: "Resolve blocked Maharashtra cotton campaign.",
    primaryAction: "Assign Field Team",
    analyticsFocus: "Territory Execution & Blockers",
    explainabilityFocus: "weather",
    kpiPriorities: ["Territory Readiness", "Blocked Campaigns", "Retailer Coverage", "Field Completion %"],
    emptyStates: {
      actions: "All territory escalations resolved.",
      recommendations: "No urgent territory signals today.",
      campaigns: "No regional campaigns blocked.",
    }
  },
  "Field Representative": {
    id: "Field Representative",
    label: "Field Representative",
    description: "On-the-ground task execution",
    demoScenario: "Complete grower outreach queue.",
    primaryAction: "Mark Visit Complete",
    analyticsFocus: "Completion Tracking",
    explainabilityFocus: "visit",
    kpiPriorities: ["Assigned Actions", "Pending Visits", "Priority Growers", "Execution Deadlines"],
    emptyStates: {
      actions: "No pending field visits for today.",
      recommendations: "No immediate grower follow-ups required.",
      campaigns: "All assigned actions completed.",
    }
  },
  "Retailer Support": {
    id: "Retailer Support",
    label: "Retailer Support",
    description: "Stock management and retailer readiness",
    demoScenario: "Respond to low-stock escalation.",
    primaryAction: "Request Replenishment",
    analyticsFocus: "Inventory Continuity",
    explainabilityFocus: "stock",
    kpiPriorities: ["Stock Risk", "Replenishment Urgency", "Inventory Blockers", "Coverage Gaps"],
    emptyStates: {
      actions: "All priority retailers currently stocked.",
      recommendations: "No critical stockouts detected.",
      campaigns: "No campaigns blocked by inventory.",
    }
  }
};

export const AVAILABLE_ROLES: RoleType[] = [
  "Campaign Manager",
  "Territory Manager",
  "Field Representative",
  "Retailer Support"
];
