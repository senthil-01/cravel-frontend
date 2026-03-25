import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, RefreshCw, CheckCircle2, XCircle,
  TrendingUp, Brain, ChevronRight, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

//const API_BASE      = "http://127.0.0.1:8000/api/v1";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// fetch(`${API_BASE}/api/v1/`)


const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;
const ALLOWED_ROLES = ["business_owner"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface CycleConfig {
  minimumOrderCount: number;
  cycleMonths:       number[];
  currentCycle: {
    cycleId:               string;
    cycleStartDate:        string;
    cycleEndDate:          string;
    ordersCollectedSoFar:  number;
    minimumMet:            boolean;
    bothConditionsMet:     boolean;
    recommendationsGenerated: boolean;
  };
}

interface Recommendation {
  recommendationId: string;
  itemCode:         string;
  menuName:         string;
  category:         string;
  segment:          string;
  status:           string;
  reason:           string;
  learningStage:    string;
  currentRule:      any;
  suggestedRule:    any;
  analytics: {
    totalOrders:          number;
    avgLeftoverPct:       number;
    shortageFrequencyPct: number;
  };
}

interface OverrideRequest {
  overrideRequestId: string;
  requestedBy:       string;
  requestedByRole:   string;
  requestedDate:     string;
  overrideType:      string;
  impactedOn: {
    itemCode:  string;
    menuName:  string;
    requestId: string;
    resultId:  string;
  };
  oldValue:           any;
  newValue:           any;
  reason:             string;
  justificationNotes: string;
}

const fmtValue = (v: any): string => {
  if (!v || typeof v !== "object") return String(v ?? "—");
  if ("totalPieces" in v) return `${v.totalPieces} pcs`;
  if ("L" in v || "M" in v || "S" in v) {
    const p = [];
    if ((v.L ?? 0) > 0) p.push(`${v.L}L`);
    if ((v.M ?? 0) > 0) p.push(`${v.M}M`);
    if ((v.S ?? 0) > 0) p.push(`${v.S}S`);
    return p.length ? p.join(" + ") : "—";
  }
  return JSON.stringify(v);
};

// ── Decision Modal ────────────────────────────────────────────────────────────
const DecisionModal = ({
  title, oldValue, newValue, onClose, onSubmit, loading, error, actionLabel, actionColor,
}: {
  title: string; oldValue?: any; newValue?: any;
  onClose: () => void; onSubmit: (notes: string) => void;
  loading: boolean; error: string;
  actionLabel: string; actionColor: string;
}) => {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        {oldValue !== undefined && newValue !== undefined && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 border border-border rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="text-sm font-medium">{fmtValue(oldValue)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Proposed</p>
              <p className="text-sm font-medium text-green-700">{fmtValue(newValue)}</p>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">Decision Notes *</label>
          <textarea rows={3} placeholder="Explain your decision..."
            value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className={`flex-1 ${actionColor}`} disabled={loading}
            onClick={() => onSubmit(notes)}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Learning Cycle Card ───────────────────────────────────────────────────────
const LearningCycleCard = ({ config }: { config: CycleConfig }) => {
  const cycle    = config.currentCycle;
  const progress = Math.min((cycle.ordersCollectedSoFar / config.minimumOrderCount) * 100, 100);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cycleLabel = (config.cycleMonths ?? []).map((m) => monthNames[m - 1]).join(" + ") || "—";

  return (
    <section className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-cream/40 flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Learning Cycle</h2>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Cycle Period</p>
            <p className="font-medium text-foreground">
              {new Date(cycle.cycleStartDate).toLocaleDateString()} → {new Date(cycle.cycleEndDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Fires On</p>
            <p className="font-medium text-foreground">{cycleLabel} 1st</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Orders collected</span>
            <span className="font-medium text-foreground">
              {cycle.ordersCollectedSoFar} / {config.minimumOrderCount}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${
            cycle.minimumMet ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-border text-muted-foreground"
          }`}>
            {cycle.minimumMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
            Minimum orders met
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${
            cycle.bothConditionsMet ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-border text-muted-foreground"
          }`}>
            {cycle.bothConditionsMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
            Cycle date reached
          </div>
        </div>

        {cycle.recommendationsGenerated && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-xs text-blue-700">
            ✅ Recommendations generated for this cycle
          </div>
        )}

        {/* Config edit */}
        <CycleConfigEdit config={config} />
      </div>
    </section>
  );
};

// ── Cycle Config Edit ─────────────────────────────────────────────────────────
const CycleConfigEdit = ({ config }: { config: CycleConfig }) => {
  const [expanded, setExpanded]       = useState(false);
  const [minOrders, setMinOrders]     = useState(String(config.minimumOrderCount));
  const [cycleMonths, setCycleMonths] = useState("");

  useEffect(() => {
    setCycleMonths((config.cycleMonths ?? []).join(","));
  }, [config.cycleMonths]);

  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const months = cycleMonths.split(",").map((m) => parseInt(m.trim())).filter((m) => m >= 1 && m <= 12);
      const res    = await fetch(`${API_BASE}/cycle-config`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          minimumOrderCount: parseInt(minOrders),
          cycleMonths:       months,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:bg-gray-50 transition-colors">
        <span>⚙️ Edit Cycle Configuration</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Minimum Orders</label>
              <input type="number" min="1" value={minOrders}
                onChange={(e) => setMinOrders(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Cycle Months <span className="text-orange-400">(e.g. 1,7)</span>
              </label>
              <input type="text" value={cycleMonths}
                onChange={(e) => setCycleMonths(e.target.value)}
                placeholder="1,7"
                className="w-full border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button size="sm"
            className={`w-full ${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-white`}
            onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? "Saved ✅" : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Recommendation Card ───────────────────────────────────────────────────────
const RecommendationCard = ({
  rec, onRefresh,
}: {
  rec: Recommendation; onRefresh: () => void;
}) => {
  const { user }                    = useAuth();
  const [expanded, setExpanded]     = useState(false);
  const [action, setAction]         = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleDecision = async (notes: string) => {
    if (!notes.trim()) { setError("Decision notes required."); return; }
    setLoading(true);
    setError("");
    try {
      const endpoint = action === "approve"
        ? `${API_BASE}/recommendations/${rec.recommendationId}/approve`
        : `${API_BASE}/recommendations/${rec.recommendationId}/reject`;

      const res  = await fetch(endpoint, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ decisionNotes: notes, decidedBy: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setAction(null);
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{rec.menuName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              {rec.learningStage}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{rec.category} · {rec.segment}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2 ${expanded ? "rotate-180" : ""}`} />
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {/* Reason */}
          <p className="text-sm text-foreground">{rec.reason}</p>

          {/* Analytics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 border border-border rounded-md p-2">
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="font-bold text-foreground">{rec.analytics.totalOrders}</p>
            </div>
            <div className={`rounded-md p-2 border ${rec.analytics.shortageFrequencyPct > 30 ? "bg-red-50 border-red-200" : "bg-gray-50 border-border"}`}>
              <p className="text-xs text-muted-foreground">Shortage %</p>
              <p className={`font-bold ${rec.analytics.shortageFrequencyPct > 30 ? "text-red-600" : "text-foreground"}`}>
                {rec.analytics.shortageFrequencyPct}%
              </p>
            </div>
            <div className={`rounded-md p-2 border ${rec.analytics.avgLeftoverPct > 40 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-border"}`}>
              <p className="text-xs text-muted-foreground">Leftover %</p>
              <p className={`font-bold ${rec.analytics.avgLeftoverPct > 40 ? "text-amber-600" : "text-foreground"}`}>
                {rec.analytics.avgLeftoverPct}%
              </p>
            </div>
          </div>

          {/* Current vs Suggested */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-border rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Rule</p>
              <p className="text-xs font-mono text-foreground">{fmtValue(rec.currentRule)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Suggested Rule</p>
              <p className="text-xs font-mono text-green-700">{fmtValue(rec.suggestedRule)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setAction("approve")}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setAction("reject")}>
              <XCircle className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          </div>
        </div>
      )}

      {action && (
        <DecisionModal
          title={action === "approve" ? "Approve Recommendation" : "Reject Recommendation"}
          oldValue={rec.currentRule}
          newValue={rec.suggestedRule}
          onClose={() => { setAction(null); setError(""); }}
          onSubmit={handleDecision}
          loading={loading}
          error={error}
          actionLabel={action === "approve" ? "Approve" : "Reject"}
          actionColor={action === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
        />
      )}
    </div>
  );
};

// ── Override Request Card ─────────────────────────────────────────────────────
const OverrideCard = ({
  request, onRefresh,
}: {
  request: OverrideRequest; onRefresh: () => void;
}) => {
  const { user }                = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [action, setAction]     = useState<"approved" | "rejected" | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleDecision = async (notes: string) => {
    if (!notes.trim()) { setError("Decision notes required."); return; }
    setLoading(true);
    setError("");
    try {
      const body = {
        overrideRequestId: request.overrideRequestId,
        decision:          action,
        decisionNotes:     notes.trim(),
      };
      const res  = await fetch(
        `${API_BASE}/override-approvals?approved_by=${user?.userId}&approved_by_role=${user?.role}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setAction(null);
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{request.impactedOn.menuName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {request.overrideType}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            By {request.requestedBy} · {new Date(request.requestedDate).toLocaleDateString()}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2 ${expanded ? "rotate-180" : ""}`} />
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-border rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Value</p>
              <p className="text-sm font-medium">{fmtValue(request.oldValue)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Requested Value</p>
              <p className="text-sm font-medium text-green-700">{fmtValue(request.newValue)}</p>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24 shrink-0">Reason</span>
              <span>{request.reason.replace(/_/g, " ")}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24 shrink-0">Justification</span>
              <span>{request.justificationNotes}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setAction("approved")}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setAction("rejected")}>
              <XCircle className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          </div>
        </div>
      )}

      {action && (
        <DecisionModal
          title={action === "approved" ? "Approve Override" : "Reject Override"}
          oldValue={request.oldValue}
          newValue={request.newValue}
          onClose={() => { setAction(null); setError(""); }}
          onSubmit={handleDecision}
          loading={loading}
          error={error}
          actionLabel={action === "approved" ? "Approve" : "Reject"}
          actionColor={action === "approved" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
        />
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const navigate          = useNavigate();
  const location = useLocation();

    useEffect(() => {
      setActiveTab("recommendations");
    }, [location.pathname]);
  const { user, displayName } = useAuth();
  
  const [cycleConfig, setCycleConfig]       = useState<CycleConfig | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [overrides, setOverrides]           = useState<OverrideRequest[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState<"recommendations" | "overrides">("recommendations");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cycleRes, recRes, ovrRes] = await Promise.all([
        fetch(`${API_BASE}/cycle-config`),
        fetch(`${API_BASE}/recommendations?status=pending`),
        fetch(`${API_BASE}/override-requests?status=pending`),
      ]);
      const [cycleData, recData, ovrData] = await Promise.all([
        cycleRes.json(), recRes.json(), ovrRes.json(),
      ]);

      if (cycleData.success) setCycleConfig(cycleData.data);
      setRecommendations(recData.data ?? recData.results ?? []);

      // filter rule/temporary/permanent overrides only for business owner
      const allOverrides = ovrData.data ?? ovrData.results ?? [];
      setOverrides(allOverrides.filter((o: OverrideRequest) =>
        ["rule", "temporary", "permanent"].includes(o.overrideType)
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!ALLOWED_ROLES.includes(user.role)) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
  setActiveTab("recommendations");
  }, [location.pathname]);

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  const totalPending = recommendations.length + overrides.length;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-primary text-lg">Owner Dashboard</h1>
            <p className="text-xs text-muted-foreground">Hi, {displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalPending > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalPending} pending
              </span>
            )}
            <button onClick={fetchData} className="text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">

        {/* Learning Cycle */}
        {cycleConfig && <LearningCycleCard config={cycleConfig} />}

        {/* Tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button onClick={() => setActiveTab("recommendations")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "recommendations" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-gray-50"
            }`}>
            <Brain className="w-4 h-4" />
            Recommendations
            {recommendations.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "recommendations" ? "bg-white text-primary" : "bg-red-500 text-white"}`}>
                {recommendations.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("overrides")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors border-l border-border ${
              activeTab === "overrides" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-gray-50"
            }`}>
            <TrendingUp className="w-4 h-4" />
            Rule Overrides
            {overrides.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "overrides" ? "bg-white text-primary" : "bg-red-500 text-white"}`}>
                {overrides.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : activeTab === "recommendations" ? (
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="bg-white border border-border rounded-xl px-5 py-12 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                <p className="text-sm text-muted-foreground">No pending recommendations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Learning engine will generate recommendations after cycle conditions are met
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <RecommendationCard key={rec.recommendationId} rec={rec} onRefresh={fetchData} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {overrides.length === 0 ? (
              <div className="bg-white border border-border rounded-xl px-5 py-12 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                <p className="text-sm text-muted-foreground">No pending rule overrides</p>
              </div>
            ) : (
              overrides.map((req) => (
                <OverrideCard key={req.overrideRequestId} request={req} onRefresh={fetchData} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;