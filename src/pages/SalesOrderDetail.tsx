import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft, Loader2, Users, Calendar,
  MapPin, Hash, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

//const API_BASE      = "http://127.0.0.1:8000/api/v1";
const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;


const ALLOWED_ROLES = ["sales_rep", "operations_manager", "catering_manager", "business_owner"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface CalcRequest {
  requestId:    string;
  status:       string;
  requestedBy:  string;
  bufferPercent: number;
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
  menuItems: { itemCode: string; category: string }[];
}

interface ItemResult {
  itemCode:     string;
  menuName:     string;
  category:     string;
  sellByCount:  boolean;
  customMode:   boolean;
  trayResult?:  { L: number; M: number; S: number };
  totalPieces?: number;
  remainderFlag?: { message: string; acknowledged: boolean } | null;
  message?:     string;
}

interface CalcResult {
  resultId:         string;
  requestId:        string;
  status:           string;
  hasCustomMode:    boolean;
  hasRemainderFlag: boolean;
  totalAmount:      number;
  summary: {
    effectiveGuests:   number;
    eventType:         string;
    serviceStyle:      string;
    bufferApplied:     number;
    eventMultiplier:   number;
    serviceMultiplier: number;
  };
  itemResults: ItemResult[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtTray = (t: { L: number; M: number; S: number }) => {
  const p = [];
  if (t.L > 0) p.push(`${t.L}L`);
  if (t.M > 0) p.push(`${t.M}M`);
  if (t.S > 0) p.push(`${t.S}S`);
  return p.length ? p.join(" + ") : "—";
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pending_review: "bg-amber-100 text-amber-700 border-amber-200",
    completed:      "bg-green-100 text-green-700 border-green-200",
    overridden:     "bg-blue-100 text-blue-700 border-blue-200",
    voided:         "bg-gray-100 text-gray-500 border-gray-200",
    failed:         "bg-red-100 text-red-600 border-red-200",
    pending:        "bg-orange-100 text-orange-700 border-orange-200",
  };
  return map[s] ?? "bg-gray-100 text-gray-600 border-gray-200";
};

// ── SalesOrderDetail ──────────────────────────────────────────────────────────
const SalesOrderDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [request, setRequest]   = useState<CalcRequest | null>(null);
  const [result, setResult]     = useState<CalcResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [itemPrices, setItemPrices] = useState<Record<string, any>>({});

  // auth check
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!ALLOWED_ROLES.includes(user.role)) navigate("/");
  }, [user, navigate]);

  // fetch data
  useEffect(() => {
    if (!requestId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [reqRes, resRes] = await Promise.all([
          fetch(`${API_BASE}/calculation-requests/${requestId}`),
          fetch(`${API_BASE}/calculation-results/request/${requestId}`),
        ]);
        const [reqData, resData] = await Promise.all([reqRes.json(), resRes.json()]);

        if (reqData.success) setRequest(reqData.data);
        if (resData.success) {
          setResult(resData.data);
          // fetch prices for non-custom items
          const prices: Record<string, any> = {};
          await Promise.all(
            resData.data.itemResults.map(async (item: ItemResult) => {
              if (item.customMode) return;
              try {
                const r    = await fetch(`${API_BASE}/menu-items/${item.itemCode}`);
                const d    = await r.json();
                prices[item.itemCode] = d.data ?? d;
              } catch {}
            })
          );
          setItemPrices(prices);
        }
      } catch (e) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  const getLineTotal = (item: ItemResult): number => {
    if (item.customMode) return 0;
    const menuItem = itemPrices[item.itemCode];
    if (!menuItem) return 0;
    if (item.sellByCount && item.totalPieces != null)
      return (menuItem.price ?? 0) * item.totalPieces;
    if (item.trayResult && menuItem.trayPrice) {
      const tp = menuItem.trayPrice;
      return (
        (item.trayResult.L ?? 0) * (tp.L ?? 0) +
        (item.trayResult.M ?? 0) * (tp.M ?? 0) +
        (item.trayResult.S ?? 0) * (tp.S ?? 0)
      );
    }
    return 0;
  };

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/sales/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <span className="text-border">|</span>
          <h1 className="font-display font-bold text-primary text-lg">Order Detail</h1>
          {request && (
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusBadge(request.status)}`}>
                {request.status.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-10">{error}</p>
        ) : request ? (
          <div className="space-y-5">

            {/* Request ID */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Hash className="w-3.5 h-3.5" /> {request.requestId}
            </div>

            {/* Event Details */}
            <section className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-cream/40">
                <h2 className="text-sm font-semibold text-foreground">Event Details</h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Event Name</p>
                  <p className="font-medium text-foreground">{request.eventDetails.eventName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Event Type</p>
                  <p className="font-medium text-foreground capitalize">{request.eventDetails.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Service Style</p>
                  <p className="font-medium text-foreground capitalize">{request.eventDetails.serviceStyle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Event Date
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(request.eventDetails.eventDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Venue
                  </p>
                  <p className="font-medium text-foreground">{request.eventDetails.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Requested By</p>
                  <p className="font-medium text-foreground">{request.requestedBy}</p>
                </div>
              </div>
            </section>

            {/* Guest Details */}
            <section className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-cream/40">
                <h2 className="text-sm font-semibold text-foreground">Guest Details</h2>
              </div>
              <div className="px-5 py-4 flex items-center gap-8 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Adults</p>
                    <p className="font-bold text-foreground text-lg">{request.guestDetails.adultCount}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kids</p>
                  <p className="font-bold text-foreground text-lg">{request.guestDetails.kidsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-foreground text-lg">{request.guestDetails.totalGuests}</p>
                </div>
                {result && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Effective Guests</p>
                      <p className="font-bold text-primary text-lg">{result.summary.effectiveGuests}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Buffer</p>
                      <p className="font-bold text-foreground text-lg">{result.summary.bufferApplied}%</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Quotation */}
            {result && (
              <section className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-cream/40 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Quotation</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(result.status)}`}>
                    {result.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {result.itemResults.map((item) => (
                    <div key={item.itemCode} className="px-5 py-3 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.menuName}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        {item.remainderFlag && !item.remainderFlag.acknowledged && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {item.remainderFlag.message}
                          </p>
                        )}
                        {item.remainderFlag?.acknowledged && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Remainder acknowledged
                          </p>
                        )}
                        {item.customMode && (
                          <p className="text-xs text-blue-600 mt-1">📋 {item.message}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        {item.customMode ? (
                          <span className="text-xs text-blue-500 font-medium">Pending</span>
                        ) : item.sellByCount ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{item.totalPieces} pcs</p>
                            {itemPrices[item.itemCode] && (
                              <p className="text-xs text-gold font-semibold">{fmtPrice(getLineTotal(item))}</p>
                            )}
                          </>
                        ) : item.trayResult ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{fmtTray(item.trayResult)}</p>
                            {itemPrices[item.itemCode] && (
                              <p className="text-xs text-gold font-semibold">{fmtPrice(getLineTotal(item))}</p>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                {!result.hasCustomMode && result.totalAmount > 0 && (
                  <div className="px-5 py-4 border-t border-border bg-cream/30 flex justify-between items-center">
                    <span className="font-display font-bold text-lg text-foreground">Total</span>
                    <span className="font-display font-bold text-2xl text-gold">{fmtPrice(result.totalAmount)}</span>
                  </div>
                )}

                {result.hasCustomMode && (
                  <div className="px-5 py-3 border-t border-border">
                    <p className="text-xs text-blue-600">
                      📋 Some items pending manual entry. Total will update after resolution.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Actions */}
            <section className="bg-white border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Actions</h2>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate(`/sales/override-request/${requestId}`)}
              >
                Raise Override Request
              </Button>
            </section>

          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">Order not found.</p>
        )}
      </div>
    </div>
  );
};

export default SalesOrderDetail;
