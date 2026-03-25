import { useState, useEffect, useRef } from "react";
import { ChevronRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportJob {
  importJobId: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  status: string;
  createdAt: string;
  itemsImported?: number;
  errors?: string[];
}

interface MenuItem {
  itemCode: string;
  name: string;
  category: string;
  vegNonVeg: string;
  sellByCount: boolean;
  trayPrices?: Record<string, number>;
  spreadValues?: Record<string, number>;
  piecesPerPerson?: number;
}

interface Multiplier {
  key: string;
  multiplierType: string;
  label: string;
  multiplier?: number;
  bufferPercent?: number;
  isActive: boolean;
  ruleVersionId?: string;
  restaurantId?: string;
}

interface RuleVersion {
  versionId: string;
  versionLabel?: string;
  versionNumber?: number;

  status: "draft" | "active" | "archived";

  createdAt: string;
  publishedAt?: string;
  activatedAt?: string | null;
  deactivatedAt?: string | null;

  createdBy?: string;
  publishedBy?: string;
  notes?: string;

  restaurantId?: string;
  previousVersionId?: string | null;
}

type Section = "home" | "import" | "menu" | "multipliers" | "versions";

// ─── API ─────────────────────────────────────────────────────────────────────

//const BASE = "http://127.0.0.1:8000/api/v1";


const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE =`${API_BASE}/api/v1`;

async function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("cravecall_token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Status Badge — matches SalesDashboard pattern ───────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const cls =
    s === "completed" || s === "success" || s === "active" || s === "veg"
      ? "bg-green-100 text-green-700"
      : s === "failed" || s === "inactive" || s === "non-veg"
      ? "bg-red-100 text-red-700"
      : s === "processing"
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600";

  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

// ─── Error Box ────────────────────────────────────────────────────────────────

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="my-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {msg}
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      ← Back
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, mono }: { title: string; mono: string }) {
  return (
    <div className="mb-6">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">{mono}</p>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    </div>
  );
}

// ─── Sub Heading ─────────────────────────────────────────────────────────────

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 min-w-[130px]">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function Table({ cols, rows }: { cols: string[]; rows: any[][] }) {
  if (rows.length === 0)
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="mx-auto mb-2 w-8 h-8 text-green-400" />
        No data found
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50">
            {cols.map((c, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {rows.map((row, ri) => (
            <tr key={ri} className="transition-colors hover:bg-gray-50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-foreground align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Import Section ───────────────────────────────────────────────────────────

function ImportSection({ onBack }: { onBack: () => void }) {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiFetch("/import/");
      setJobs(res.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!file || !uploadedBy.trim()) { setUploadMsg("Fill uploaded_by and choose a file."); return; }
    setUploading(true); setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("uploaded_by", uploadedBy);
      fd.append("file", file);
      const token = localStorage.getItem("cravecall_token");
      const res = await fetch(`${BASE}/import/`, {
        method: "POST", body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || res.statusText);
      setUploadMsg(`✓ Import job created: ${data.importJobId}`);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e: any) { setUploadMsg(`⚠ ${e.message}`); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete ALL import data for this restaurant? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiFetch("/import/restaurant", { method: "DELETE" });
      setJobs([]);
    } catch (e: any) { setError(e.message); }
    finally { setDeleting(false); }
  };

  const loadJobDetail = async (id: string) => {
    try {
      const res = await apiFetch(`/import/${id}`);
      setSelectedJob(res.data);
    } catch (e: any) { setError(e.message); }
  };

  if (selectedJob) return (
    <div>
      <Back onClick={() => setSelectedJob(null)} />
      <SectionHeader title="Import Job Detail" mono={selectedJob.importJobId} />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          ["File", selectedJob.fileName],
          ["Size", fmt(selectedJob.fileSize)],
          ["Uploaded By", selectedJob.uploadedBy],
          ["Status", <StatusBadge status={selectedJob.status} />],
          ["Created", fmtDate(selectedJob.createdAt)],
          ["Items Imported", selectedJob.itemsImported ?? "—"],
        ].map(([k, v], i) => (
          <InfoCard key={i} label={k as string} value={v} />
        ))}
      </div>
      {selectedJob.errors && selectedJob.errors.length > 0 && (
        <div>
          <SubHead>Errors</SubHead>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 max-h-56 overflow-y-auto space-y-1">
            {selectedJob.errors.map((e, i) => (
              <p key={i} className="font-mono text-xs text-red-600">→ {e}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Back onClick={onBack} />
      <SectionHeader title="Excel Import" mono="C11 · excel_import_jobs" />

      {/* Upload panel */}
      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-primary">
          Upload New Menu File
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Uploaded By
            </label>
            <Input
              value={uploadedBy}
              onChange={e => setUploadedBy(e.target.value)}
              placeholder="admin@cravecall.com"
              className="w-56"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              File (.xlsx / .xls)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="text-sm text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Uploading...</>
              : "Upload & Import"}
          </Button>
        </div>
        {uploadMsg && (
          <p className={`mt-3 text-xs font-mono ${uploadMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
            {uploadMsg}
          </p>
        )}
      </div>

      {/* Job list */}
      {loading ? <Spinner /> : error ? <ErrorBox msg={error} /> : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[11px] text-muted-foreground">{jobs.length} job(s) found</p>
            <button
              onClick={handleDelete}
              disabled={deleting || jobs.length === 0}
              className="rounded border border-red-200 px-3 py-1 font-mono text-[11px] text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete All Restaurant Data"}
            </button>
          </div>
          <Table
            cols={["Job ID", "File", "Size", "Uploaded By", "Status", "Created"]}
            rows={jobs.map(j => [
              <span
                className="font-mono text-xs text-primary cursor-pointer hover:underline"
                onClick={() => loadJobDetail(j.importJobId)}
              >{j.importJobId}</span>,
              j.fileName,
              fmt(j.fileSize),
              j.uploadedBy,
              <StatusBadge status={j.status} />,
              fmtDate(j.createdAt),
            ])}
          />
        </>
      )}
    </div>
  );
}

// ─── Menu Section ─────────────────────────────────────────────────────────────

function MenuSection({ onBack }: { onBack: () => void }) {
  const CATS = ["All", "Appetizer", "Rice", "Bread", "Entree", "Dessert"];
  const [cat, setCat] = useState("All");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  useEffect(() => {
    setLoading(true); setError("");
    const q = cat !== "All" ? `?category=${cat}` : "";
    apiFetch(`/menu-items/${q}`)
      .then(res => setItems(res.data || res || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [cat]);

  if (selected) return (
    <div>
      <Back onClick={() => setSelected(null)} />
      <SectionHeader title={selected.name} mono={selected.itemCode} />
      <div className="flex flex-wrap gap-3 mb-5">
        <InfoCard label="Category" value={selected.category} />
        <InfoCard label="Veg / Non-Veg" value={<StatusBadge status={selected.vegNonVeg} />} />
        <InfoCard label="Sell By Count" value={selected.sellByCount ? "Yes" : "No"} />
        <InfoCard label="Pieces / Person" value={selected.piecesPerPerson ?? "—"} />
      </div>
      {selected.trayPrices && (
        <div>
          <SubHead>Tray Prices</SubHead>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(selected.trayPrices).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-white px-5 py-3 text-center min-w-[80px]">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">{k}</p>
                <p className="font-semibold text-primary">₹{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selected.spreadValues && (
        <div>
          <SubHead>Spread Values</SubHead>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(selected.spreadValues).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-white px-5 py-3 text-center min-w-[80px]">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">{k}</p>
                <p className="font-semibold text-foreground">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Back onClick={onBack} />
      <SectionHeader title="Menu Items" mono="C1 · menu_item_rules" />
      <div className="mb-5 flex flex-wrap gap-2">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : error ? <ErrorBox msg={error} /> : (
        <Table
          cols={["Item Code", "Name", "Category", "Veg/Non-Veg", "Sell By Count"]}
          rows={items.map(item => [
            <span
              className="font-mono text-xs text-primary cursor-pointer hover:underline"
              onClick={() => setSelected(item)}
            >{item.itemCode}</span>,
            item.name,
            item.category,
            <StatusBadge status={item.vegNonVeg ?? "—"} />,
            item.sellByCount ? "Yes" : "No",
          ])}
        />
      )}
    </div>
  );
}

// ─── Update Multiplier Modal ──────────────────────────────────────────────────

function UpdateMultiplierModal({
  item, onClose, onSuccess,
}: {
  item: Multiplier;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [label, setLabel]               = useState(item.label);
  const [multiplier, setMultiplier]     = useState(String(item.multiplier ?? ""));
  const [bufferPercent, setBufferPercent] = useState(String(item.bufferPercent ?? ""));
  const [isActive, setIsActive]         = useState(item.isActive);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);

  const isBuffer = item.multiplierType === "buffer";

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const body: Record<string, any> = { label, isActive };
      if (isBuffer) {
        body.bufferPercent = parseFloat(bufferPercent);
      } else {
        body.multiplier = parseFloat(multiplier);
      }
      await apiFetch(
        `/multipliers/${item.key}?multiplier_type=${item.multiplierType}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground">Update Multiplier</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mb-5 uppercase tracking-widest">
          {item.key} · {item.multiplierType}
        </p>

        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Label
            </label>
            <Input value={label} onChange={e => setLabel(e.target.value)} />
          </div>

          {/* Value field — bufferPercent OR multiplier */}
          {isBuffer ? (
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Buffer Percent (%)
              </label>
              <Input
                type="number" step="0.1" min="0"
                value={bufferPercent}
                onChange={e => setBufferPercent(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Multiplier Value
              </label>
              <Input
                type="number" step="0.01" min="0"
                value={multiplier}
                onChange={e => setMultiplier(e.target.value)}
              />
            </div>
          )}

          {/* isActive toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="text-sm text-foreground">Active</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        {success && <p className="mt-3 text-xs text-green-600">✓ Updated successfully</p>}

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={loading || success}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Multiplier Table with Update button ─────────────────────────────────────

function MultiplierTable({
  data, isBuffer, onUpdate,
}: {
  data: Multiplier[];
  isBuffer: boolean;
  onUpdate: (item: Multiplier) => void;
}) {
  const valueCol    = isBuffer ? "Buffer %" : "Multiplier";
  const valueRender = (m: Multiplier) =>
    isBuffer
      ? <span className="font-mono font-bold text-blue-600">{m.bufferPercent}%</span>
      : <span className="font-mono font-bold text-amber-600">×{m.multiplier}</span>;

  return (
    <Table
      cols={["Label", "Key", valueCol, "Status", ""]}
      rows={data.map(m => [
        <span className="font-medium text-foreground">{m.label}</span>,
        <span className="font-mono text-xs text-muted-foreground">{m.key}</span>,
        valueRender(m),
        <StatusBadge status={m.isActive ? "active" : "inactive"} />,
        <button
          onClick={() => onUpdate(m)}
          className="rounded border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Update
        </button>,
      ])}
    />
  );
}

// ─── Multipliers Section ──────────────────────────────────────────────────────

type MTab = "event" | "service" | "buffer" | "audience";

function MultipliersSection({ onBack }: { onBack: () => void }) {
  const [tab, setTab]     = useState<MTab>("event");
  const [data, setData]   = useState<Multiplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [editItem, setEditItem] = useState<Multiplier | null>(null);

  const fetchTab = (t: MTab) => {
    setLoading(true); setError("");
    apiFetch(`/multipliers/?multiplier_type=${t}&is_active=true`)
      .then(res => setData(res.data || res || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTab(tab); }, [tab]);

  const TABS: { key: MTab; label: string }[] = [
    { key: "event",    label: "Event" },
    { key: "service",  label: "Service" },
    { key: "buffer",   label: "Buffer %" },
    { key: "audience", label: "Audience" },
  ];

  const isBuffer = tab === "buffer";

  return (
    <div>
      <Back onClick={onBack} />
      <SectionHeader title="Multipliers" mono="C2 · rule_multipliers" />

      {/* 4 tabs in one row */}
      <div className="mb-5 flex overflow-hidden rounded-lg border border-border w-fit">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-white text-muted-foreground hover:bg-gray-50"
            } ${i > 0 ? "border-l border-border" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorBox msg={error} /> : (
        <MultiplierTable data={data} isBuffer={isBuffer} onUpdate={setEditItem} />
      )}

      {editItem && (
        <UpdateMultiplierModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => { setEditItem(null); fetchTab(tab); }}
        />
      )}
    </div>
  );
}

// ─── Rule Versions Section ────────────────────────────────────────────────────

function VersionsSection({ onBack }: { onBack: () => void }) {
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RuleVersion | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    apiFetch("/versions/")
      .then(res => setVersions(res.data || res || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadVersion = async (v: RuleVersion) => {
    setSelected(v); setItemsLoading(true);
    try {
      const res = await apiFetch(`/menu-items/version/${v.versionId}`);
      setItems(res.data || res || []);
    } catch (e: any) { setError(e.message); }
    finally { setItemsLoading(false); }
  };

  if (selected) return (
    <div>
      <Back onClick={() => { setSelected(null); setItems([]); }} />
      <SectionHeader title={selected.versionLabel || selected.versionId} mono={selected.versionId} />
      <div className="flex flex-wrap gap-3 mb-6">
        <InfoCard label="Status" value={<StatusBadge status={selected.status} />} />
        <InfoCard label="Created" value={fmtDate(selected.createdAt)} />
        {selected.createdBy && <InfoCard label="Created By" value={selected.createdBy} />}
        {selected.notes && <InfoCard label="Notes" value={selected.notes} />}
      </div>
      <SubHead>Menu Items in this Version</SubHead>
      {itemsLoading ? <Spinner /> : (
        <Table
          cols={["Item Code", "Name", "Category", "Veg/Non-Veg"]}
          rows={items.map(item => [
            <span className="font-mono text-xs text-primary">{item.itemCode}</span>,
            item.name,
            item.category,
            <StatusBadge status={item.vegNonVeg ?? "—"} />,
          ])}
        />
      )}
    </div>
  );

  return (
    <div>
      <Back onClick={onBack} />
      <SectionHeader title="Rule Versions" mono="C3 · rule_versions" />
      {loading ? <Spinner /> : error ? <ErrorBox msg={error} /> : (
        <Table
          cols={["Version ID", "Label", "Status", "Created By", "Created At"]}
          rows={versions.map(v => [
            <span
              className="font-mono text-xs text-primary cursor-pointer hover:underline"
              onClick={() => loadVersion(v)}
            >{v.versionId}</span>,
            v.versionLabel || "—",
            <StatusBadge status={v.status} />,
            v.createdBy || "—",
            fmtDate(v.createdAt),
          ])}
        />
      )}
    </div>
  );
}

// ─── Landing Cards ────────────────────────────────────────────────────────────

interface CardDef {
  id: Section;
  label: string;
  mono: string;
  desc: string;
  collection: string;
  accentClass: string;
  iconBg: string;
  icon: string;
}

const CARDS: CardDef[] = [
  {
    id: "import", label: "Excel Import", mono: "C11", collection: "excel_import_jobs",
    desc: "Upload menu files, track import jobs, manage bulk data",
    accentClass: "text-blue-600", iconBg: "bg-blue-50", icon: "⬆",
  },
  {
    id: "menu", label: "Menu Items", mono: "C1", collection: "menu_item_rules",
    desc: "Browse dish rules, spread values, tray prices by category",
    accentClass: "text-green-600", iconBg: "bg-green-50", icon: "▤",
  },
  {
    id: "multipliers", label: "Multipliers", mono: "C2", collection: "rule_multipliers",
    desc: "Event and service multipliers driving the calculation engine",
    accentClass: "text-amber-600", iconBg: "bg-amber-50", icon: "×",
  },
  {
    id: "versions", label: "Rule Versions", mono: "C3", collection: "rule_versions",
    desc: "Version history of active and archived catering rule sets",
    accentClass: "text-primary", iconBg: "bg-gray-100", icon: "◎",
  },
];

function LandingCards({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [bufferPct, setBufferPct]       = useState<string>("—");
  const [activeRule, setActiveRule]     = useState<string>("—");
  const [constantsLoading, setConstantsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/multipliers/?multiplier_type=buffer&is_active=true"),
      apiFetch("/versions/"),
    ])
      .then(([bufRes, verRes]) => {
        const bufList = bufRes.data || bufRes || [];
        if (bufList[0]?.bufferPercent !== undefined) {
          setBufferPct(`${bufList[0].bufferPercent}%`);
        }
        const verList = verRes.data || verRes || [];
        const active = verList.find((v: any) => v.status === "active");
        if (active) setActiveRule(active.versionId);
      })
      .catch(() => {})
      .finally(() => setConstantsLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">
          CraveCall.ai · Admin Console
        </p>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          RESTAURANT_ID: rest_001 · Active Rule: {constantsLoading ? "…" : activeRule}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group rounded-xl border border-border bg-white p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${card.iconBg} ${card.accentClass}`}>
                {card.icon}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className={`mb-0.5 font-mono text-[10px] uppercase tracking-widest ${card.accentClass}`}>
              {card.mono} · {card.collection}
            </p>
            <p className="mb-2 font-semibold text-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* Engine constants strip — live from DB */}
      <div className="mt-5 rounded-xl border border-border bg-white p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Engine Constants
        </p>
        <div className="flex flex-wrap gap-8">
          {[
            ["Default Buffer", constantsLoading ? "…" : bufferPct],
            ["Active Rule",    constantsLoading ? "…" : activeRule],
            ["Overridden Weight", "×2"],
            ["Final Weight",     "×1"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="font-mono text-[10px] text-muted-foreground">{k}</p>
              <p className="font-mono font-bold text-amber-600">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("home");

  const NAV: [Section, string][] = [
    ["home", "Home"],
    ["import", "Import"],
    ["menu", "Menu"],
    ["multipliers", "Multipliers"],
    ["versions", "Versions"],
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Top bar — same sticky pattern as SalesDashboard */}
      <div className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-bold text-primary">CC·ADMIN</span>
            <div className="h-4 w-px bg-border" />
            <nav className="flex items-center gap-1">
              {NAV.map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                    section === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <span className="font-mono text-xs text-muted-foreground">admin@cravecall.com</span>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {section === "home"        && <LandingCards onNavigate={setSection} />}
        {section === "import"      && <ImportSection onBack={() => setSection("home")} />}
        {section === "menu"        && <MenuSection onBack={() => setSection("home")} />}
        {section === "multipliers" && <MultipliersSection onBack={() => setSection("home")} />}
        {section === "versions"    && <VersionsSection onBack={() => setSection("home")} />}
      </div>
    </div>
  );
}