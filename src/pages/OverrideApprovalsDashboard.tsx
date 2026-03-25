import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronRight, Loader2, CheckCircle2, XCircle,
  RefreshCw, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

//const API_BASE = "http://127.0.0.1:8000/api/v1";

const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;
const ALLOWED_ROLES       = ["admin", "catering_manager", "business_owner"];
const CALCULATION_ROLES   = ["admin", "catering_manager"];
const RULE_ROLES          = ["business_owner"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface OverrideRequest {
  overrideRequestId: string;
  requestedBy:       string;
  requestedByRole:   string;
  requestedDate:     string;
  overrideType:      string;
  status:            string;
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
  effectiveFrom?:     string;
  effectiveTo?:       string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtValue = (v: any): string => {
  if (!v || typeof v !== "object") return String(v ?? "—");
  if ("totalPieces" in v) return `${v.totalPieces} pcs`;
  if ("L" in v || "M" in v || "S" in v) {
    const p = [];
    if (v.L > 0) p.push(`${v.L}L`);
    if (v.M > 0) p.push(`${v.M}M`);
    if (v.S > 0) p.push(`${v.S}S`);
    return p.length ? p.join(" + ") : "—";
  }
  return JSON.stringify(v);
};

const reasonLabel = (r: string) =>
  r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ── Decision Modal ────────────────────────────────────────────────────────────
const DecisionModal = ({
  request, decision, onClose, onSuccess,
}: {
  request: OverrideRequest;
  decision: "approved" | "rejected";
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { user }                          = useAuth();
  const [decisionNotes, setDecisionNotes] = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const handleSubmit = async () => {
    if (!decisionNotes.trim()) { setError("Decision notes are required."); return; }
    setLoading(true);
    setError("");
    try {
      const body = {
        overrideRequestId: request.overrideRequestId,
        decision,
        decisionNotes: decisionNotes.trim(),
      };
      const res  = await fetch(
        `${API_BASE}/override-approvals?approved_by=${user?.userId ?? "unknown"}&approved_by_role=${user?.role ?? "unknown"}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(
        Array.isArray(data.detail)
          ? data.detail.map((e: any) => e.msg).join(", ")
          : data.detail || "Failed"
      );
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`flex items-center gap-2 mb-4`}>
          {decision === "approved"
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : <XCircle className="w-5 h-5 text-red-500" />}
          <h3 className="font-semibold text-foreground">
            {decision === "approved" ? "Approve" : "Reject"} Override
          </h3>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-border rounded-md p-3 mb-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item</span>
            <span className="font-medium">{request.impactedOn.menuName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Old Value</span>
            <span className="font-medium">{fmtValue(request.oldValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">New Value</span>
            <span className={`font-medium ${decision === "approved" ? "text-green-600" : "text-red-500"}`}>
              {fmtValue(request.newValue)}
            </span>
          </div>
        </div>

        {/* Decision Notes */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">
            Decision Notes * <span className="text-orange-400">(required)</span>
          </label>
          <textarea rows={3} placeholder="Explain your decision..."
            value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
          <Button
            className={`flex-1 font-semibold ${
              decision === "approved"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            onClick={handleSubmit} disabled={loading}>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : decision === "approved" ? "Approve" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Request Card ──────────────────────────────────────────────────────────────
const RequestCard = ({
  request, onRefresh,
}: {
  request: OverrideRequest; onRefresh: () => void;
}) => {
  const [expanded, setExpanded]   = useState(false);
  const [decision, setDecision]   = useState<"approved" | "rejected" | null>(null);

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {request.impactedOn.menuName}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
              {request.overrideType}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            By {request.requestedBy} ({reasonLabel(request.requestedByRole)}) ·{" "}
            {new Date(request.requestedDate).toLocaleDateString()}
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2 ${expanded ? "rotate-90" : ""}`} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">

          {/* Old vs New */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-border rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Value</p>
              <p className="text-sm font-medium text-foreground">{fmtValue(request.oldValue)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Requested Value</p>
              <p className="text-sm font-medium text-green-700">{fmtValue(request.newValue)}</p>
            </div>
          </div>

          {/* Reason + Justification */}
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24 shrink-0">Reason</span>
              <span className="font-medium text-foreground">{reasonLabel(request.reason)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24 shrink-0">Justification</span>
              <span className="text-foreground">{request.justificationNotes}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24 shrink-0">Request ID</span>
              <span className="font-mono text-xs text-muted-foreground">{request.impactedOn.requestId}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={() => setDecision("approved")}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
              onClick={() => setDecision("rejected")}>
              <XCircle className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decision && (
        <DecisionModal
          request={request} decision={decision}
          onClose={() => setDecision(null)}
          onSuccess={() => { setDecision(null); onRefresh(); }}
        />
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const OverrideApprovalsDashboard = () => {
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [requests, setRequests] = useState<OverrideRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // hooks before auth check
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_BASE}/override-requests?status=pending`);
      const data = await res.json();
      const all  = data.data ?? data.results ?? [];

      // filter by role
      const filtered = CALCULATION_ROLES.includes(user.role)
        ? all.filter((r: OverrideRequest) => r.overrideType === "calculation")
        : all.filter((r: OverrideRequest) => ["rule", "temporary", "permanent"].includes(r.overrideType));

      setRequests(filtered);
    } catch {
      setError("Failed to load override requests.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!ALLOWED_ROLES.includes(user.role)) navigate("/");
  }, [user, navigate]);

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display font-bold text-primary text-lg">Override Approvals</h1>
              <p className="text-xs text-muted-foreground">
                {CALCULATION_ROLES.includes(user?.role ?? "")
                  ? "Calculation overrides"
                  : "Rule / policy overrides"}
              </p>
            </div>
            {requests.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
          <button onClick={fetchData} className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-10">{error}</p>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-border rounded-xl px-5 py-12 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="text-sm text-muted-foreground">No pending override requests</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by requestId */}
            {Object.entries(
              requests.reduce((groups: Record<string, OverrideRequest[]>, req) => {
                const key = req.impactedOn.requestId ?? "unknown";
                if (!groups[key]) groups[key] = [];
                groups[key].push(req);
                return groups;
              }, {})
            ).map(([reqId, reqs]) => (
              <div key={reqId}>
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-mono text-muted-foreground">{reqId}</p>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {reqs.length} request{reqs.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {reqs.map((req) => (
                    <RequestCard key={req.overrideRequestId} request={req} onRefresh={fetchData} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverrideApprovalsDashboard;