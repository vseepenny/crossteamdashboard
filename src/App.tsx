import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoadmapItem {
  id: string;
  title: string;
  team: string;
  status: "Discovery" | "Design" | "In Development" | "QA" | "Shipping Soon";
  priority: "P0" | "P1" | "P2";
  quarter: string;
  owner: string;
  description: string;
}

interface Deal {
  id: string;
  company: string;
  value: string;
  stage: "Prospecting" | "Qualified" | "Proposal" | "Negotiation" | "Closing";
  probability: number;
  owner: string;
  closeDate: string;
  product: string;
  notes: string;
}

interface AllocationEntry {
  engineer: string;
  role: string;
  projects: { name: string; percentage: number; color: string }[];
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_ROADMAP: RoadmapItem[] = [
  { id: "R1", title: "Multi-provider Video Routing", team: "Platform", status: "In Development", priority: "P0", quarter: "Q2 2026", owner: "Sarah Chen", description: "Route video calls across multiple cloud providers for redundancy" },
  { id: "R2", title: "AI Visit Summary", team: "Product", status: "Design", priority: "P0", quarter: "Q2 2026", owner: "James Park", description: "Auto-generate visit summaries using LLM after telehealth sessions" },
  { id: "R3", title: "Patient Intake Forms v2", team: "Product", status: "In Development", priority: "P1", quarter: "Q2 2026", owner: "Maria Lopez", description: "Redesigned intake flow with conditional logic and e-signatures" },
  { id: "R4", title: "FHIR R4 Integration", team: "Platform", status: "Discovery", priority: "P1", quarter: "Q2 2026", owner: "David Kim", description: "Full FHIR R4 compliance for EHR interoperability" },
  { id: "R5", title: "Group Video Sessions", team: "Product", status: "QA", priority: "P0", quarter: "Q2 2026", owner: "Sarah Chen", description: "Support up to 8 participants in a single telehealth session" },
  { id: "R6", title: "Waiting Room Redesign", team: "Design", status: "Design", priority: "P2", quarter: "Q2 2026", owner: "Lisa Wang", description: "Modern waiting room UX with estimated wait times and queue position" },
  { id: "R7", title: "RPM Device Dashboard", team: "Product", status: "Discovery", priority: "P1", quarter: "Q3 2026", owner: "James Park", description: "Centralized dashboard for remote patient monitoring devices" },
  { id: "R8", title: "SSO / SAML Support", team: "Platform", status: "Shipping Soon", priority: "P0", quarter: "Q2 2026", owner: "David Kim", description: "Enterprise SSO via SAML 2.0 and OIDC" },
  { id: "R9", title: "Mobile SDK Refresh", team: "Platform", status: "In Development", priority: "P1", quarter: "Q2 2026", owner: "Alex Rivera", description: "Updated iOS/Android SDKs with WebRTC improvements" },
  { id: "R10", title: "Analytics & Reporting v3", team: "Product", status: "Design", priority: "P1", quarter: "Q3 2026", owner: "Maria Lopez", description: "Advanced analytics with custom report builder and scheduled exports" },
  { id: "R11", title: "Automated Appointment Reminders", team: "Product", status: "QA", priority: "P2", quarter: "Q2 2026", owner: "Lisa Wang", description: "SMS/email reminders with smart scheduling" },
  { id: "R12", title: "Provider Availability API", team: "Platform", status: "Discovery", priority: "P2", quarter: "Q3 2026", owner: "Alex Rivera", description: "Public API for provider scheduling and availability" },
  { id: "R13", title: "Consent Management Module", team: "Product", status: "In Development", priority: "P0", quarter: "Q2 2026", owner: "James Park", description: "Configurable consent flows meeting state-by-state telehealth regs" },
  { id: "R14", title: "White-label Theming Engine", team: "Design", status: "Design", priority: "P1", quarter: "Q3 2026", owner: "Lisa Wang", description: "Full CSS theming system for enterprise white-label deployments" },
  { id: "R15", title: "Billing Integration (Stripe)", team: "Platform", status: "Discovery", priority: "P2", quarter: "Q3 2026", owner: "David Kim", description: "Native Stripe integration for co-pay and subscription billing" },
];

const SAMPLE_DEALS: Deal[] = [
  { id: "D1", company: "Kaiser Permanente", value: "$2.4M", stage: "Negotiation", probability: 75, owner: "Tom Bradley", closeDate: "2026-04-15", product: "Enterprise Platform", notes: "Final contract review with legal" },
  { id: "D2", company: "Cleveland Clinic", value: "$1.8M", stage: "Proposal", probability: 50, owner: "Rachel Green", closeDate: "2026-05-01", product: "Video + RPM Bundle", notes: "Waiting on budget approval from CTO" },
  { id: "D3", company: "Teladoc Health", value: "$3.2M", stage: "Qualified", probability: 30, owner: "Tom Bradley", closeDate: "2026-06-30", product: "Platform License", notes: "Multi-year deal, needs board approval" },
  { id: "D4", company: "Mount Sinai Health", value: "$950K", stage: "Closing", probability: 90, owner: "Nina Patel", closeDate: "2026-03-28", product: "Video SDK", notes: "Paperwork in progress, expected to close this week" },
  { id: "D5", company: "Advocate Health", value: "$1.1M", stage: "Proposal", probability: 45, owner: "Rachel Green", closeDate: "2026-05-15", product: "Enterprise Platform", notes: "Demo went well, follow-up scheduled" },
  { id: "D6", company: "Intermountain Health", value: "$780K", stage: "Prospecting", probability: 15, owner: "Nina Patel", closeDate: "2026-07-30", product: "Video + Analytics", notes: "Initial outreach, warm intro from existing customer" },
  { id: "D7", company: "VA Health System", value: "$4.5M", stage: "Qualified", probability: 35, owner: "Tom Bradley", closeDate: "2026-09-01", product: "Gov Platform", notes: "FedRAMP compliance discussion ongoing" },
  { id: "D8", company: "Ascension Health", value: "$1.3M", stage: "Negotiation", probability: 70, owner: "Nina Patel", closeDate: "2026-04-20", product: "Enterprise Platform", notes: "Negotiating multi-site rollout pricing" },
  { id: "D9", company: "HCA Healthcare", value: "$2.1M", stage: "Proposal", probability: 40, owner: "Rachel Green", closeDate: "2026-06-15", product: "Video + RPM Bundle", notes: "Pilot completed successfully, scaling discussion" },
  { id: "D10", company: "Optum / UHG", value: "$5.8M", stage: "Prospecting", probability: 10, owner: "Tom Bradley", closeDate: "2026-10-01", product: "Platform License", notes: "Early conversations with innovation team" },
];

const SAMPLE_ALLOCATION: AllocationEntry[] = [
  { engineer: "Sarah Chen", role: "Staff Engineer", projects: [{ name: "Video Routing", percentage: 60, color: "#3b82f6" }, { name: "Group Sessions", percentage: 30, color: "#8b5cf6" }, { name: "Tech Debt", percentage: 10, color: "#94a3b8" }] },
  { engineer: "David Kim", role: "Senior Engineer", projects: [{ name: "SSO/SAML", percentage: 50, color: "#f59e0b" }, { name: "FHIR R4", percentage: 40, color: "#10b981" }, { name: "On-Call", percentage: 10, color: "#94a3b8" }] },
  { engineer: "Alex Rivera", role: "Senior Engineer", projects: [{ name: "Mobile SDK", percentage: 70, color: "#ec4899" }, { name: "Video Routing", percentage: 20, color: "#3b82f6" }, { name: "Mentoring", percentage: 10, color: "#94a3b8" }] },
  { engineer: "James Park", role: "Engineer II", projects: [{ name: "AI Visit Summary", percentage: 50, color: "#6366f1" }, { name: "Consent Module", percentage: 40, color: "#14b8a6" }, { name: "Sprint Support", percentage: 10, color: "#94a3b8" }] },
  { engineer: "Maria Lopez", role: "Engineer II", projects: [{ name: "Intake Forms v2", percentage: 60, color: "#f97316" }, { name: "Analytics v3", percentage: 30, color: "#a855f7" }, { name: "Bug Fixes", percentage: 10, color: "#94a3b8" }] },
  { engineer: "Wei Zhang", role: "Engineer I", projects: [{ name: "Intake Forms v2", percentage: 40, color: "#f97316" }, { name: "Consent Module", percentage: 30, color: "#14b8a6" }, { name: "Automated Reminders", percentage: 30, color: "#06b6d4" }] },
  { engineer: "Priya Sharma", role: "Engineer I", projects: [{ name: "Group Sessions", percentage: 50, color: "#8b5cf6" }, { name: "Waiting Room", percentage: 30, color: "#e11d48" }, { name: "Testing", percentage: 20, color: "#94a3b8" }] },
  { engineer: "Mike Torres", role: "QA Lead", projects: [{ name: "Group Sessions QA", percentage: 40, color: "#8b5cf6" }, { name: "Reminders QA", percentage: 30, color: "#06b6d4" }, { name: "Regression Suite", percentage: 30, color: "#94a3b8" }] },
];

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
}

// ─── Google Identity Services (loaded dynamically) ───────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;
function loadGIS(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google sign-in. Check your internet connection."));
    document.head.appendChild(s);
  });
  return gisPromise;
}

// ─── Google Sheets API fetch ─────────────────────────────────────────────────

function extractSpreadsheetId(input: string): string | null {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input.trim())) return input.trim();
  return null;
}

function extractGid(input: string): string | null {
  const m = input.match(/[#&?]gid=(\d+)/);
  return m ? m[1] : null;
}

async function fetchSheetViaAPI(token: string, spreadsheetId: string, gid: string | null): Promise<Record<string, string>[]> {
  // First resolve gid to sheet name
  let sheetName = "Sheet1";
  if (gid !== null) {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      const sheet = meta.sheets?.find((s: any) => String(s.properties?.sheetId) === gid);
      if (sheet) sheetName = sheet.properties.title;
    }
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName)}?valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.error?.message || res.statusText;
    if (res.status === 404) throw new Error(`Spreadsheet or tab not found. Check the URL. (${detail})`);
    if (res.status === 403) throw new Error(`Access denied. Your Google account doesn't have access to this sheet. (${detail})`);
    if (res.status === 401) throw new Error("Session expired. Sign out and sign in again.");
    throw new Error(`Sheets API error ${res.status}: ${detail}`);
  }
  const data = await res.json();
  const rows: string[][] = data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0].map((h: string) => h.trim());
  return rows.slice(1).map((row: string[]) => {
    const obj: Record<string, string> = {};
    headers.forEach((h: string, i: number) => { obj[h] = (row[i] || "").trim(); });
    return obj;
  });
}

// ─── Public CSV export URL builder ───────────────────────────────────────────

function toCSVExportUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.includes("/pub") && trimmed.includes("output=csv")) return trimmed;
  const id = extractSpreadsheetId(trimmed);
  if (!id) return trimmed;
  const gid = extractGid(trimmed);
  let url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  if (gid) url += `&gid=${gid}`;
  return url;
}

// ─── Config types ────────────────────────────────────────────────────────────

interface GoogleUser { name: string; email: string; picture: string; }

interface SheetConfig {
  mode: "public" | "google";
  clientId: string;
  roadmapUrl: string;
  dealsUrl: string;
  allocationUrl: string;
}

// ─── Settings Panel ──────────────────────────────────────────────────────────

function SettingsPanel({
  config, onSave, lastFetched, user, onSignIn, onSignOut, authLoading,
}: {
  config: SheetConfig;
  onSave: (c: SheetConfig) => void;
  lastFetched: Date | null;
  user: GoogleUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  authLoading: boolean;
}) {
  const [local, setLocal] = useState(config);
  const [open, setOpen] = useState(false);
  useEffect(() => { setLocal(config); }, [config]);

  const sources: { label: string; key: "roadmapUrl" | "dealsUrl" | "allocationUrl"; cols: string }[] = [
    { label: "Product Roadmap", key: "roadmapUrl", cols: "title, team, status, priority, quarter, owner, description" },
    { label: "Sales Pipeline", key: "dealsUrl", cols: "company, value, stage, probability, owner, closeDate, product, notes" },
    { label: "Engineer Allocation", key: "allocationUrl", cols: "engineer, role, project, percentage, color" },
  ];

  const isGoogle = local.mode === "google";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-md hover:bg-muted transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Data Sources
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[560px] bg-card border rounded-lg shadow-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Connect Google Sheets</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-md border mb-4 text-sm overflow-hidden">
            <button
              onClick={() => setLocal({ ...local, mode: "public" })}
              className={`flex-1 px-3 py-2 text-center transition-colors ${!isGoogle ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
            >
              Public Link
            </button>
            <button
              onClick={() => setLocal({ ...local, mode: "google" })}
              className={`flex-1 px-3 py-2 text-center transition-colors ${isGoogle ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
            >
              Google Sign-In
            </button>
          </div>

          {/* Mode-specific instructions */}
          <div className="p-3 bg-muted/50 rounded-md mb-4 text-xs text-muted-foreground space-y-1">
            {isGoogle ? (
              <>
                <p className="font-medium text-foreground">For private / team-only sheets:</p>
                <p>Sign in with your Google account to access sheets shared with your team. No need to make anything public.</p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">For public sheets:</p>
                <p>Set sharing to "Anyone with the link" can view, then paste the URL below.</p>
              </>
            )}
          </div>

          {/* Google auth section */}
          {isGoogle && (
            <div className="mb-4 p-3 border rounded-md">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.picture && <img src={user.picture} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />}
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={onSignOut} className="text-xs text-muted-foreground hover:text-foreground underline">Sign out</button>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">OAuth Client ID</label>
                    <input
                      type="text"
                      placeholder="123456789.apps.googleusercontent.com"
                      value={local.clientId}
                      onChange={(e) => setLocal({ ...local, clientId: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      From <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="underline">Google Cloud Console</a>. Add <strong>{window.location.origin}</strong> as an authorized JavaScript origin. Enable the Google Sheets API.
                    </span>
                  </div>
                  <button
                    onClick={() => { onSave({ ...local }); onSignIn(); }}
                    disabled={!local.clientId || authLoading}
                    className="px-3 py-1.5 text-sm bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
                  >
                    {authLoading ? (
                      <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    )}
                    Sign in with Google
                  </button>
                </>
              )}
            </div>
          )}

          {/* Sheet URL inputs */}
          {sources.map(({ label, key, cols }) => (
            <div key={key} className="mb-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={local[key]}
                onChange={(e) => setLocal({ ...local, [key]: e.target.value })}
                disabled={isGoogle && !user}
                className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Columns: {cols}</span>
            </div>
          ))}

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              {lastFetched ? `Last synced: ${lastFetched.toLocaleTimeString()}` : "Using sample data"}
            </span>
            <button
              onClick={() => { onSave(local); setOpen(false); }}
              disabled={isGoogle && !user}
              className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save & Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Status helpers ──────────────────────────────────────────────────────────

const statusOrder: Record<string, number> = { "Shipping Soon": 0, "QA": 1, "In Development": 2, "Design": 3, "Discovery": 4 };
const statusColor: Record<string, string> = {
  "Discovery": "bg-slate-100 text-slate-700 border-slate-200",
  "Design": "bg-violet-50 text-violet-700 border-violet-200",
  "In Development": "bg-blue-50 text-blue-700 border-blue-200",
  "QA": "bg-amber-50 text-amber-700 border-amber-200",
  "Shipping Soon": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const priorityColor: Record<string, string> = {
  "P0": "bg-red-50 text-red-700 border-red-200",
  "P1": "bg-orange-50 text-orange-700 border-orange-200",
  "P2": "bg-slate-50 text-slate-600 border-slate-200",
};
const stageOrder: Record<string, number> = { "Closing": 0, "Negotiation": 1, "Proposal": 2, "Qualified": 3, "Prospecting": 4 };
const stageColor: Record<string, string> = {
  "Prospecting": "bg-slate-100 text-slate-700",
  "Qualified": "bg-sky-50 text-sky-700",
  "Proposal": "bg-violet-50 text-violet-700",
  "Negotiation": "bg-amber-50 text-amber-700",
  "Closing": "bg-emerald-50 text-emerald-700",
};

// ─── Roadmap View ────────────────────────────────────────────────────────────

function RoadmapView({ items }: { items: RoadmapItem[] }) {
  const sorted = [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.priority.localeCompare(b.priority));
  const statusGroups = ["Shipping Soon", "QA", "In Development", "Design", "Discovery"];
  const counts = statusGroups.map((s) => ({ status: s, count: sorted.filter((i) => i.status === s).length }));

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {counts.map(({ status, count }) => (
          <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${statusColor[status]}`}>
            <span>{status}</span><span className="opacity-60">&middot;</span><span>{count}</span>
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[340px]">Item</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[90px]">Team</TableHead>
                <TableHead className="w-[80px]">Quarter</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item) => (
                <TooltipProvider key={item.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TableRow className="cursor-default">
                        <TableCell>
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[320px]">{item.description}</div>
                        </TableCell>
                        <TableCell><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${priorityColor[item.priority]}`}>{item.priority}</span></TableCell>
                        <TableCell><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${statusColor[item.status]}`}>{item.status}</span></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.team}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.quarter}</TableCell>
                        <TableCell className="text-sm">{item.owner}</TableCell>
                      </TableRow>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs"><p className="text-xs">{item.description}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sales Pipeline View ─────────────────────────────────────────────────────

function parseDealValue(val: string): number {
  const num = parseFloat(val.replace(/[^0-9.]/g, ""));
  if (val.includes("M")) return num * 1_000_000;
  if (val.includes("K")) return num * 1_000;
  return num;
}

function PipelineView({ deals }: { deals: Deal[] }) {
  const sorted = [...deals].sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage] || b.probability - a.probability);
  const totalPipeline = deals.reduce((s, d) => s + parseDealValue(d.value), 0);
  const weightedPipeline = deals.reduce((s, d) => s + parseDealValue(d.value) * d.probability / 100, 0);
  const avgProbability = Math.round(deals.reduce((s, d) => s + d.probability, 0) / deals.length);
  const stageGroups = ["Closing", "Negotiation", "Proposal", "Qualified", "Prospecting"];
  const stageSummary = stageGroups.map((stage) => {
    const sd = deals.filter((d) => d.stage === stage);
    return { stage, count: sd.length, value: sd.reduce((s, d) => s + parseDealValue(d.value), 0) };
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Total Pipeline</div><div className="text-2xl font-semibold tracking-tight">${(totalPipeline / 1e6).toFixed(1)}M</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Weighted Pipeline</div><div className="text-2xl font-semibold tracking-tight">${(weightedPipeline / 1e6).toFixed(1)}M</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Avg Probability</div><div className="text-2xl font-semibold tracking-tight">{avgProbability}%</div></CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-1 h-8">
            {stageSummary.map(({ stage, value }) => (
              <TooltipProvider key={stage} delayDuration={100}><Tooltip><TooltipTrigger asChild>
                <div className={`${stageColor[stage]} rounded-sm transition-all hover:opacity-80`} style={{ flex: value / totalPipeline, height: "100%", minWidth: value > 0 ? 24 : 0 }} />
              </TooltipTrigger><TooltipContent><p className="text-xs font-medium">{stage}: ${(value / 1e6).toFixed(1)}M</p></TooltipContent></Tooltip></TooltipProvider>
            ))}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {stageSummary.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-sm ${stageColor[stage]}`} />{stage} ({count})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Company</TableHead>
                <TableHead className="w-[100px] text-right">Value</TableHead>
                <TableHead className="w-[120px]">Stage</TableHead>
                <TableHead className="w-[100px] text-right">Probability</TableHead>
                <TableHead className="w-[110px]">Close Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[200px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell><div className="font-medium text-sm">{deal.company}</div><div className="text-xs text-muted-foreground">{deal.product}</div></TableCell>
                  <TableCell className="text-right font-medium text-sm">{deal.value}</TableCell>
                  <TableCell><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${stageColor[deal.stage]}`}>{deal.stage}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${deal.probability}%`, backgroundColor: deal.probability >= 70 ? "#10b981" : deal.probability >= 40 ? "#f59e0b" : "#94a3b8" }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{deal.probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{deal.closeDate}</TableCell>
                  <TableCell className="text-sm">{deal.owner}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{deal.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Allocation View ─────────────────────────────────────────────────────────

function AllocationView({ entries }: { entries: AllocationEntry[] }) {
  const projectMap: Record<string, { totalPct: number; engineers: string[]; color: string }> = {};
  entries.forEach((e) => { e.projects.forEach((p) => {
    if (!projectMap[p.name]) projectMap[p.name] = { totalPct: 0, engineers: [], color: p.color };
    projectMap[p.name].totalPct += p.percentage;
    projectMap[p.name].engineers.push(e.engineer);
  }); });
  const projectSummary = Object.entries(projectMap).sort((a, b) => b[1].totalPct - a[1].totalPct).map(([name, data]) => ({ name, ...data }));
  const totalCapacity = entries.length * 100;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Capacity by Project</CardTitle>
          <CardDescription className="text-xs">Total engineering capacity: {entries.length} engineers &middot; {totalCapacity}% available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectSummary.slice(0, 12).map((project) => (
            <div key={project.name} className="flex items-center gap-3">
              <div className="w-[160px] text-sm font-medium truncate">{project.name}</div>
              <div className="flex-1 h-5 bg-muted rounded overflow-hidden relative">
                <TooltipProvider delayDuration={100}><Tooltip><TooltipTrigger asChild>
                  <div className="h-full rounded transition-all hover:opacity-80" style={{ width: `${(project.totalPct / totalCapacity) * 100}%`, backgroundColor: project.color, opacity: 0.75 }} />
                </TooltipTrigger><TooltipContent><p className="text-xs">{project.engineers.join(", ")}</p></TooltipContent></Tooltip></TooltipProvider>
              </div>
              <div className="w-20 text-right">
                <span className="text-sm font-medium">{Math.round((project.totalPct / totalCapacity) * 100)}%</span>
                <span className="text-xs text-muted-foreground ml-1">({project.engineers.length})</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Individual Allocation</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="w-[160px]">Engineer</TableHead><TableHead className="w-[120px]">Role</TableHead><TableHead>Allocation</TableHead></TableRow></TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.engineer}>
                  <TableCell className="font-medium text-sm">{entry.engineer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex h-6 rounded overflow-hidden">
                        {entry.projects.map((p, i) => (
                          <TooltipProvider key={i} delayDuration={100}><Tooltip><TooltipTrigger asChild>
                            <div className="h-full transition-all hover:opacity-90 flex items-center justify-center" style={{ width: `${p.percentage}%`, backgroundColor: p.color, opacity: 0.75 }}>
                              {p.percentage >= 25 && <span className="text-[10px] font-medium text-white drop-shadow-sm truncate px-1">{p.name}</span>}
                            </div>
                          </TooltipTrigger><TooltipContent><p className="text-xs">{p.name}: {p.percentage}%</p></TooltipContent></Tooltip></TooltipProvider>
                        ))}
                      </div>
                      <div className="flex gap-1 flex-shrink-0 w-20 justify-end">
                        {entry.projects.map((p, i) => <span key={i} className="text-[10px] text-muted-foreground">{p.percentage}%</span>)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function App() {
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({ mode: "public", clientId: "", roadmapUrl: "", dealsUrl: "", allocationUrl: "" });
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(SAMPLE_ROADMAP);
  const [deals, setDeals] = useState<Deal[]>(SAMPLE_DEALS);
  const [allocation, setAllocation] = useState<AllocationEntry[]>(SAMPLE_ALLOCATION);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ source: string; message: string }[]>([]);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const accessTokenRef = useRef<string | null>(null);

  // ── Row mappers ──
  const mapRoadmap = (rows: Record<string, string>[]) => rows.map((r, i) => ({
    id: `R${i + 1}`, title: r["title"] || r["Title"] || "", team: r["team"] || r["Team"] || "",
    status: (r["status"] || r["Status"] || "Discovery") as RoadmapItem["status"],
    priority: (r["priority"] || r["Priority"] || "P2") as RoadmapItem["priority"],
    quarter: r["quarter"] || r["Quarter"] || "", owner: r["owner"] || r["Owner"] || "",
    description: r["description"] || r["Description"] || "",
  }));

  const mapDeals = (rows: Record<string, string>[]) => rows.map((r, i) => ({
    id: `D${i + 1}`, company: r["company"] || r["Company"] || "", value: r["value"] || r["Value"] || "$0",
    stage: (r["stage"] || r["Stage"] || "Prospecting") as Deal["stage"],
    probability: parseInt(r["probability"] || r["Probability"] || "0"),
    owner: r["owner"] || r["Owner"] || "", closeDate: r["closeDate"] || r["Close Date"] || "",
    product: r["product"] || r["Product"] || "", notes: r["notes"] || r["Notes"] || "",
  }));

  const mapAllocation = (rows: Record<string, string>[]): AllocationEntry[] => {
    const engineerMap: Record<string, AllocationEntry> = {};
    const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#f97316", "#06b6d4", "#6366f1", "#14b8a6", "#e11d48"];
    let colorIdx = 0;
    rows.forEach((r) => {
      const eng = r["engineer"] || r["Engineer"] || "";
      const role = r["role"] || r["Role"] || "";
      const project = r["project"] || r["Project"] || "";
      const pct = parseInt(r["percentage"] || r["Percentage"] || "0");
      const color = r["color"] || r["Color"] || colors[colorIdx++ % colors.length];
      if (!eng) return;
      if (!engineerMap[eng]) engineerMap[eng] = { engineer: eng, role, projects: [] };
      if (project && pct > 0) engineerMap[eng].projects.push({ name: project, percentage: pct, color });
    });
    return Object.values(engineerMap);
  };

  // ── Google Sign-In ──
  const handleSignIn = useCallback(async () => {
    if (!sheetConfig.clientId) { setErrors([{ source: "Google Auth", message: "Enter your OAuth Client ID first." }]); return; }
    if (window.location.protocol === "file:") {
      setErrors([{ source: "Google Auth", message: "Google sign-in doesn't work from a file:// URL. Run the included start.sh script to launch a local server, then open http://localhost:8080" }]);
      return;
    }
    setAuthLoading(true);
    setErrors([]);
    try { await loadGIS(); } catch {
      setAuthLoading(false);
      setErrors([{ source: "Google Auth", message: "Failed to load Google sign-in. Check your internet connection." }]);
      return;
    }
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: sheetConfig.clientId,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      callback: async (response) => {
        if (response.error) { setAuthLoading(false); setErrors([{ source: "Google Auth", message: `Authentication failed: ${response.error}` }]); return; }
        if (response.access_token) {
          accessTokenRef.current = response.access_token;
          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${response.access_token}` } });
            if (res.ok) { const info = await res.json(); setUser({ name: info.name, email: info.email, picture: info.picture }); }
            else { setUser({ name: "Google User", email: "", picture: "" }); }
          } catch { setUser({ name: "Google User", email: "", picture: "" }); }
          setAuthLoading(false);
        }
      },
      error_callback: (error) => {
        setAuthLoading(false);
        if (error.type === "popup_closed") return;
        setErrors([{ source: "Google Auth", message: `Sign-in error: ${error.type}` }]);
      },
    });
    tokenClient.requestAccessToken();
  }, [sheetConfig.clientId]);

  const handleSignOut = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setRoadmap(SAMPLE_ROADMAP);
    setDeals(SAMPLE_DEALS);
    setAllocation(SAMPLE_ALLOCATION);
    setLastFetched(null);
    setErrors([]);
  }, []);

  // ── Fetch data (supports both modes) ──
  const fetchSheetData = useCallback(async (config: SheetConfig, token: string | null) => {
    setLoading(true);
    const newErrors: { source: string; message: string }[] = [];

    async function fetchSource(rawUrl: string, sourceName: string): Promise<Record<string, string>[] | null> {
      if (!rawUrl.trim()) return null;

      if (config.mode === "google" && token) {
        // Use Sheets API with auth token
        const id = extractSpreadsheetId(rawUrl);
        if (!id) { newErrors.push({ source: sourceName, message: "Couldn't extract a spreadsheet ID from that URL." }); return null; }
        try { return await fetchSheetViaAPI(token, id, extractGid(rawUrl)); }
        catch (err) { newErrors.push({ source: sourceName, message: err instanceof Error ? err.message : "Unknown error" }); return null; }
      } else {
        // Public CSV export
        const csvUrl = toCSVExportUrl(rawUrl);
        try {
          const res = await fetch(csvUrl);
          if (!res.ok) {
            if (res.status === 403 || res.status === 401) newErrors.push({ source: sourceName, message: "Access denied. Set sharing to \"Anyone with the link\" can view, or switch to Google Sign-In mode for private sheets." });
            else if (res.status === 404) newErrors.push({ source: sourceName, message: "Spreadsheet not found. Check the URL." });
            else newErrors.push({ source: sourceName, message: `HTTP ${res.status}. Check the URL and sharing settings.` });
            return null;
          }
          const text = await res.text();
          if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
            newErrors.push({ source: sourceName, message: "Got a web page instead of data. Set sharing to \"Anyone with the link\" can view, or switch to Google Sign-In for private sheets." });
            return null;
          }
          const rows = parseCSV(text);
          if (rows.length === 0) { newErrors.push({ source: sourceName, message: "Sheet has no data rows." }); return null; }
          return rows;
        } catch (err) {
          const msg = err instanceof TypeError && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))
            ? "Network error. Check your internet connection." : err instanceof Error ? err.message : "Unknown error";
          newErrors.push({ source: sourceName, message: msg });
          return null;
        }
      }
    }

    const [roadmapRows, dealsRows, allocationRows] = await Promise.all([
      fetchSource(config.roadmapUrl, "Product Roadmap"),
      fetchSource(config.dealsUrl, "Sales Pipeline"),
      fetchSource(config.allocationUrl, "Engineer Allocation"),
    ]);

    if (config.roadmapUrl.trim() && roadmapRows) setRoadmap(mapRoadmap(roadmapRows));
    else if (!config.roadmapUrl.trim()) setRoadmap(SAMPLE_ROADMAP);

    if (config.dealsUrl.trim() && dealsRows) setDeals(mapDeals(dealsRows));
    else if (!config.dealsUrl.trim()) setDeals(SAMPLE_DEALS);

    if (config.allocationUrl.trim() && allocationRows) setAllocation(mapAllocation(allocationRows));
    else if (!config.allocationUrl.trim()) setAllocation(SAMPLE_ALLOCATION);

    if (newErrors.length === 0) setLastFetched(new Date());
    setErrors(newErrors);
    setLoading(false);
  }, []);

  // Auto-refresh
  useEffect(() => {
    const hasUrls = sheetConfig.roadmapUrl.trim() || sheetConfig.dealsUrl.trim() || sheetConfig.allocationUrl.trim();
    if (!hasUrls) return;
    if (sheetConfig.mode === "google" && !accessTokenRef.current) return;

    fetchSheetData(sheetConfig, accessTokenRef.current);
    const interval = setInterval(() => fetchSheetData(sheetConfig, accessTokenRef.current), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [sheetConfig, fetchSheetData, user]);

  const handleConfigSave = (config: SheetConfig) => {
    setSheetConfig(config);
    fetchSheetData(config, accessTokenRef.current);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Cross-Team Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Product &middot; Sales &middot; Engineering</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {user.picture && <img src={user.picture} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />}
                <span>{user.name.split(" ")[0]}</span>
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />Syncing...
              </div>
            )}
            <SettingsPanel config={sheetConfig} onSave={handleConfigSave} lastFetched={lastFetched} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} authLoading={authLoading} />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 mb-1">{errors.length === 1 ? "Failed to load data source" : `Failed to load ${errors.length} data sources`}</p>
                {errors.map((err, i) => (
                  <div key={i} className="text-sm text-red-700 mt-1"><span className="font-medium">{err.source}:</span> <span className="text-red-600">{err.message}</span></div>
                ))}
                <p className="text-xs text-red-500 mt-2">Showing previously loaded data. Check your settings in Data Sources and try again.</p>
              </div>
              <button onClick={() => setErrors([])} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="roadmap">
          <TabsList className="mb-5">
            <TabsTrigger value="roadmap" className="text-sm">Product Roadmap<Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{roadmap.length}</Badge></TabsTrigger>
            <TabsTrigger value="pipeline" className="text-sm">Sales Pipeline<Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{deals.length}</Badge></TabsTrigger>
            <TabsTrigger value="allocation" className="text-sm">Engineer Allocation<Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{allocation.length}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="roadmap"><RoadmapView items={roadmap} /></TabsContent>
          <TabsContent value="pipeline"><PipelineView deals={deals} /></TabsContent>
          <TabsContent value="allocation"><AllocationView entries={allocation} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
