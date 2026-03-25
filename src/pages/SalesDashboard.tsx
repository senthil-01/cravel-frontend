import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ALLOWED_ROLES = ["sales_rep", "operations_manager", "catering_manager"];
import {
  Bell, ClipboardList, ChevronRight, Loader2,
  AlertTriangle, CheckCircle2, Clock, RefreshCw,
  Users, Calendar, MapPin, X, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Constants ─────────────────────────────────────────────────────────────────
//const API_BASE = "http://127.0.0.1:8000/api/v1";


const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;

const ROLE_LABELS: Record<string, string> = {
  sales_rep:           "Sales",
  operations_manager:  "Operations",
  catering_manager:    "Catering",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ItemResult {
  itemCode:    string;
  menuName:    string;
  category:    string;
  sellByCount: boolean;
  customMode:  boolean;
  trayResult?: { L: number; M: number; S: number };
  totalPieces?: number;
  remainderFlag?: {
    message:        string;
    acknowledged:   boolean;
    remainingGuests: number;
    guestPercentage: number;
    sPercentage:    number;
    smallTrayCapacity: number;
  } | null;
  message?: string;
}

interface CalcResult {
  resultId:         string;
  requestId:        string;
  hasCustomMode:    boolean;
  hasRemainderFlag: boolean;
  totalAmount:      number;
  summary: {
    effectiveGuests: number;
    eventType:       string;
    serviceStyle:    string;
  };
  itemResults: ItemResult[];
}

interface CalcRequest {
  requestId:    string;
  status:       string;
  requestedBy:  string;
  createdAt:    string;
  eventDetails: {
    eventName:    string;
    eventType:    string;
    serviceStyle: string;
    eventDate:    string;
    venue:        string;
  };
  guestDetails: {
    adultCount:  number;
    kidsCount:   number;
    totalGuests: number;
  };
}

const fmtPrice = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtTray = (t: { L: number; M: number; S: number }) => {
  const p = [];
  if (t.L > 0) p.push(`${t.L}L`);
  if (t.M > 0) p.push(`${t.M}M`);
  if (t.S > 0) p.push(`${t.S}S`);
  return p.length ? p.join(" + ") : "—";
};

const statusColor = (s: string) => {
  if (s === "pending_review") return "bg-amber-100 text-amber-700";
  if (s === "completed")      return "bg-green-100 text-green-700";
  if (s === "order_placed")   return "bg-blue-100 text-blue-700";
  if (s === "failed")         return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

// ── Manual Entry Modal ────────────────────────────────────────────────────────
const ManualEntryModal = ({
  item, requestId, requestedBy, requestedByRole, onClose, onSuccess,
}: {
  item: ItemResult; requestId: string;
  requestedBy: string; requestedByRole: string;
  onClose: () => void; onSuccess: () => void;
}) => {
  const [L, setL]           = useState("");
  const [M, setM]           = useState("");
  const [S, setS]           = useState("");
  const [pieces, setPieces] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const body: any = { requestId, itemCode: item.itemCode };
      if (item.sellByCount) {
        if (!pieces) { setError("Please enter total pieces."); setLoading(false); return; }
        body.totalPieces = parseFloat(pieces);
      } else {
        body.trayResult = {
          L: parseInt(L) || 0,
          M: parseInt(M) || 0,
          S: parseInt(S) || 0,
        };
      }

      const res = await fetch(
        `${API_BASE}/calculation-results/manual-entry?requested_by=${requestedBy}&requested_by_role=${requestedByRole}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{item.menuName}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{item.message}</p>

        {item.sellByCount ? (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Total Pieces *</label>
            <Input type="number" min="0" placeholder="e.g. 200" value={pieces} onChange={(e) => setPieces(e.target.value)} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {["L", "M", "S"].map((size) => (
              <div key={size}>
                <label className="text-xs text-muted-foreground mb-1 block">{size} Trays</label>
                <Input type="number" min="0" placeholder="0"
                  value={size === "L" ? L : size === "M" ? M : S}
                  onChange={(e) => size === "L" ? setL(e.target.value) : size === "M" ? setM(e.target.value) : setS(e.target.value)} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" />Submit</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Acknowledge Modal ─────────────────────────────────────────────────────────
const AcknowledgeModal = ({
  item, requestId, requestedBy, onClose, onSuccess,
}: {
  item: ItemResult; requestId: string;
  requestedBy: string;
  onClose: () => void; onSuccess: () => void;
}) => {
  const [extraAmount, setExtraAmount] = useState("");
  const [extraNote, setExtraNote]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const body: any = {
        requestId,
        itemCode:       item.itemCode,
        acknowledgedBy: requestedBy,
      };
      if (extraAmount) {
        body.extraAmountAdded = parseFloat(extraAmount);
        body.extraAmountNote  = extraNote || null;
      }

      const res = await fetch(
        `${API_BASE}/calculation-results/acknowledge-remainder`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rf = item.remainderFlag;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{item.menuName}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {rf && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-xs text-amber-700 space-y-1">
            <p>{rf.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Extra Amount (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" className="pl-7"
                value={extraAmount} onChange={(e) => setExtraAmount(e.target.value)} />
            </div>
          </div>
          {extraAmount && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Note</label>
              <Input placeholder="e.g. Added extra for safety margin"
                value={extraNote} onChange={(e) => setExtraNote(e.target.value)} />
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Acknowledge</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Notification Card ─────────────────────────────────────────────────────────
const NotificationCard = ({
  result, type, onRefresh, requestedBy, requestedByRole,
}: {
  result: CalcResult; type: "custom" | "remainder"; onRefresh: () => void;
  requestedBy: string; requestedByRole: string;
}) => {
  const [expanded, setExpanded]           = useState(false);
  const [activeItem, setActiveItem]       = useState<ItemResult | null>(null);
  const [modalType, setModalType]         = useState<"manual" | "acknowledge" | null>(null);

  const pendingItems = type === "custom"
    ? result.itemResults.filter((i) => i.customMode)
    : result.itemResults.filter((i) => i.remainderFlag && !i.remainderFlag.acknowledged);

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${type === "custom" ? "bg-blue-500" : "bg-amber-500"}`} />
          <div>
            <p className="text-sm font-semibold text-foreground">{result.requestId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {result.summary.eventType} · {result.summary.serviceStyle} · {result.summary.effectiveGuests} guests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type === "custom" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
            {pendingItems.length} pending
          </span>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {pendingItems.map((item) => (
            <div key={item.itemCode} className="px-5 py-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.menuName}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
                {type === "remainder" && item.remainderFlag && (
                  <p className="text-xs text-amber-600 mt-1">{item.remainderFlag.message}</p>
                )}
                {type === "custom" && (
                  <p className="text-xs text-blue-600 mt-1">{item.message}</p>
                )}
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs shrink-0"
                onClick={() => { setActiveItem(item); setModalType(type === "custom" ? "manual" : "acknowledge"); }}
              >
                {type === "custom" ? "Fill" : "Acknowledge"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeItem && modalType === "manual" && (
        <ManualEntryModal
          item={activeItem} requestId={result.requestId}
          requestedBy={requestedBy} requestedByRole={requestedByRole}
          onClose={() => { setActiveItem(null); setModalType(null); }}
          onSuccess={() => { setActiveItem(null); setModalType(null); onRefresh(); }}
        />
      )}
      {activeItem && modalType === "acknowledge" && (
        <AcknowledgeModal
          item={activeItem} requestId={result.requestId}
          requestedBy={requestedBy}
          onClose={() => { setActiveItem(null); setModalType(null); }}
          onSuccess={() => { setActiveItem(null); setModalType(null); onRefresh(); }}
        />
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SalesDashboard = () => {
  const navigate  = useNavigate();
  const { user, displayName }  = useAuth();

  const requestedBy     = user?.userId   ?? "unknown";
  const requestedByRole = user?.role     ?? "sales_rep";
  const roleLabel       = ROLE_LABELS[user?.role ?? ""] ?? "Dashboard";

  // ── all hooks first — before any conditional return ──────────────────────
  const [customResults, setCustomResults]   = useState<CalcResult[]>([]);
  const [remainderResults, setRemainder]    = useState<CalcResult[]>([]);
  const [recentRequests, setRecentRequests] = useState<CalcRequest[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState<"notifications" | "orders">("notifications");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [customRes, remainderRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE}/calculation-results/?has_custom_mode=true&status=pending_review`),
        fetch(`${API_BASE}/calculation-results/?has_remainder_flag=true&status=pending_review`),
        fetch(`${API_BASE}/calculation-requests/?page=1&page_size=20&exclude_voided=true`),
      ]);

      const [customData, remainderData, requestsData] = await Promise.all([
        customRes.json(), remainderRes.json(), requestsRes.json(),
      ]);

      setCustomResults(customData.results ?? []);
      setRemainder(remainderData.results ?? []);
      setRecentRequests(requestsData.results ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── auth check after hooks ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!ALLOWED_ROLES.includes(user.role)) navigate("/");
  }, [user, navigate]);

  const totalNotifications = customResults.length + remainderResults.length;

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display font-bold text-primary text-lg">{roleLabel}</h1>
              <p className="text-xs text-muted-foreground">Hi, {displayName}</p>
            </div>
            {totalNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalNotifications}
              </span>
            )}
          </div>
          <button onClick={fetchData} className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Record Outcomes — catering_manager only */}
        {user?.role === "catering_manager" && (
          <div
            onClick={() => navigate("/outcomes/new")}
            className="bg-primary text-primary-foreground rounded-xl p-5 mb-6 flex items-center justify-between cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <div>
              <p className="font-display font-bold text-lg">📋 Record Order Outcomes</p>
              <p className="text-sm text-primary-foreground/80 mt-0.5">
                Record actual vs recommended trays after event
              </p>
            </div>
            <ChevronRight className="w-6 h-6 shrink-0" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-6">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "notifications" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-gray-50"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
            {totalNotifications > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "notifications" ? "bg-white text-primary" : "bg-red-500 text-white"}`}>
                {totalNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors border-l border-border ${
              activeTab === "orders" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-gray-50"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Orders
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : activeTab === "notifications" ? (

          /* ── Notifications Tab ── */
          <div className="space-y-6">

            {/* Custom Mode */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold text-foreground">
                  Custom Mode <span className="text-muted-foreground font-normal">— Manual entry required</span>
                </h2>
                <span className="ml-auto text-xs text-blue-600 font-medium">{customResults.length}</span>
              </div>
              {customResults.length === 0 ? (
                <div className="bg-white border border-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  All clear — no pending manual entries
                </div>
              ) : (
                <div className="space-y-3">
                  {customResults.map((r) => (
                    <NotificationCard key={r.resultId} result={r} type="custom" onRefresh={fetchData}
                      requestedBy={requestedBy} requestedByRole={requestedByRole} />
                  ))}
                </div>
              )}
            </div>

            {/* Remainder Flag */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">
                  Remainder Flag <span className="text-muted-foreground font-normal">— Acknowledgement required</span>
                </h2>
                <span className="ml-auto text-xs text-amber-600 font-medium">{remainderResults.length}</span>
              </div>
              {remainderResults.length === 0 ? (
                <div className="bg-white border border-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  All clear — no pending acknowledgements
                </div>
              ) : (
                <div className="space-y-3">
                  {remainderResults.map((r) => (
                    <NotificationCard key={r.resultId} result={r} type="remainder" onRefresh={fetchData}
                      requestedBy={requestedBy} requestedByRole={requestedByRole} />
                  ))}
                </div>
              )}
            </div>
          </div>

        ) : (

          /* ── Orders Tab ── */
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <div className="bg-white border border-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
                No orders found
              </div>
            ) : (
              recentRequests.map((req) => (
                <div key={req.requestId}
                  className="bg-white border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => navigate(`/sales/orders/${req.requestId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {req.eventDetails?.eventName ?? req.requestId}
                      </p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor(req.status)}`}>
                        {req.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {req.guestDetails?.totalGuests ?? "—"} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {req.eventDetails?.eventDate
                          ? new Date(req.eventDetails.eventDate).toLocaleDateString()
                          : "—"}
                      </span>
                      {req.eventDetails?.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {req.eventDetails.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;