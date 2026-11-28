"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import {
  AwardIcon,
  EyeIcon,
  SparklesIcon,
  UsersIcon,
  WhatsAppIcon,
} from "./AdminIcons";

export interface AnalyticsEventRow {
  id: string;
  event_name: string;
  page_path: string | null;
  property_title: string | null;
  utm_source: string | null;
  created_at: string;
}

type DateRangeDays = 7 | 30;

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toWibDateKey(ms: number): string {
  const wib = new Date(ms + WIB_OFFSET_MS);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wib.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toWibShortLabel(ms: number): string {
  const wib = new Date(ms + WIB_OFFSET_MS);
  const d = String(wib.getUTCDate()).padStart(2, "0");
  const mon = MONTHS_ID[wib.getUTCMonth()];
  return `${d} ${mon}`;
}

interface DailyPoint {
  dateKey: string;
  label: string;
  PageView: number;
  ViewContent: number;
  Contact: number;
  Lead: number;
}

interface TopPropertyItem {
  title: string;
  views: number;
}

interface AdminAnalyticsOverviewProps {
  initialEvents: AnalyticsEventRow[];
  initialError: string | null;
  referenceTimestamp: number;
}

export default function AdminAnalyticsOverview({
  initialEvents,
  initialError,
  referenceTimestamp,
}: AdminAnalyticsOverviewProps) {
  const [events, setEvents] = useState<AnalyticsEventRow[]>(initialEvents);
  const [rangeDays, setRangeDays] = useState<DateRangeDays>(7);
  const [nowMs, setNowMs] = useState<number>(referenceTimestamp);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const freshNow = Date.now();
      const sinceIso = new Date(freshNow - 30 * DAY_MS).toISOString();
      const supabase = createClient();
      const { data, error } = await supabase
        .from("analytics_events")
        .select(
          "id, event_name, page_path, property_title, utm_source, created_at"
        )
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEvents((data as AnalyticsEventRow[] | null) ?? []);
      setNowMs(freshNow);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Gagal memuat ulang data analitik.";
      setErrorMsg(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const { dailySeries, totals, topProperties } = useMemo(() => {
    const bucketMap = new Map<string, DailyPoint>();
    const orderedBuckets: DailyPoint[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const dayMs = nowMs - i * DAY_MS;
      const dateKey = toWibDateKey(dayMs);
      const point: DailyPoint = {
        dateKey,
        label: toWibShortLabel(dayMs),
        PageView: 0,
        ViewContent: 0,
        Contact: 0,
        Lead: 0,
      };
      bucketMap.set(dateKey, point);
      orderedBuckets.push(point);
    }

    const propertyViews = new Map<string, number>();
    const counts = {
      PageView: 0,
      ViewContent: 0,
      Contact: 0,
      Lead: 0,
    };

    for (const ev of events) {
      const ts = new Date(ev.created_at).getTime();
      if (Number.isNaN(ts)) continue;
      const dateKey = toWibDateKey(ts);
      const bucket = bucketMap.get(dateKey);
      if (!bucket) continue;

      if (ev.event_name === "PageView") {
        bucket.PageView += 1;
        counts.PageView += 1;
      } else if (ev.event_name === "ViewContent") {
        bucket.ViewContent += 1;
        counts.ViewContent += 1;
        const propName = ev.property_title?.trim();
        if (propName) {
          propertyViews.set(propName, (propertyViews.get(propName) ?? 0) + 1);
        }
      } else if (ev.event_name === "Contact") {
        bucket.Contact += 1;
        counts.Contact += 1;
      } else if (ev.event_name === "Lead") {
        bucket.Lead += 1;
        counts.Lead += 1;
      }
    }

    const top5: TopPropertyItem[] = Array.from(propertyViews.entries())
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      dailySeries: orderedBuckets,
      totals: counts,
      topProperties: top5,
    };
  }, [events, rangeDays, nowMs]);

  const maxTopViews = topProperties[0]?.views ?? 1;
  const waRate =
    totals.PageView > 0
      ? ((totals.Contact / totals.PageView) * 100).toFixed(1)
      : "0.0";
  const leadRate =
    totals.PageView > 0
      ? ((totals.Lead / totals.PageView) * 100).toFixed(1)
      : "0.0";

  return (
    <section aria-label="Analitik Pengunjung Website" className="space-y-5">
      {/* Section Header + Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-sans text-lg sm:text-xl font-bold text-white">
            Analitik &amp;{" "}
            <span className="font-normal italic text-[#C8A15A]">
              Trafik Pengunjung
            </span>
          </h2>
          <p className="text-xs text-white/55 mt-0.5">
            Pelacakan first-party pengunjung publik dalam {rangeDays} hari
            terakhir (WIB).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div
            role="group"
            aria-label="Filter rentang waktu analitik"
            className="inline-flex rounded-full bg-[#0B1513] border border-white/12 p-1"
          >
            <button
              type="button"
              onClick={() => setRangeDays(7)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                rangeDays === 7
                  ? "bg-[#C8A15A] text-[#070D0C]"
                  : "text-white/65 hover:text-white"
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(30)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                rangeDays === 30
                  ? "bg-[#C8A15A] text-[#070D0C]"
                  : "text-white/65 hover:text-white"
              }`}
            >
              30 Hari Terakhir
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 px-4 rounded-full border border-white/15 bg-[#0B1513] text-xs font-semibold text-white/80 hover:border-[#C8A15A]/55 hover:text-[#C8A15A] disabled:opacity-50 transition cursor-pointer"
          >
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-2xl bg-amber-500/12 border border-amber-400/35 px-4 py-3 text-xs sm:text-sm text-amber-100"
        >
          Catatan analitik: {errorMsg}
        </div>
      )}

      {/* Analytics KPI Row (Dark Glass Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Kunjungan (PageView) */}
        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Total Kunjungan
              </p>
              <p className="text-3xl font-sans font-bold text-white mt-2">
                {totals.PageView}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Event <span className="font-semibold text-white/80">PageView</span>{" "}
            ({rangeDays} hari terakhir)
          </p>
        </div>

        {/* KPI 2: Lihat Properti (ViewContent) */}
        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Lihat Properti
              </p>
              <p className="text-3xl font-sans font-bold text-[#C8A15A] mt-2">
                {totals.ViewContent}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#C8A15A] flex items-center justify-center shrink-0">
              <EyeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Event{" "}
            <span className="font-semibold text-white/80">ViewContent</span>{" "}
            halaman detail
          </p>
        </div>

        {/* KPI 3: Klik WhatsApp (Contact) */}
        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Klik WhatsApp
              </p>
              <p className="text-3xl font-sans font-bold text-emerald-400 mt-2">
                {totals.Contact}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Rasio klik {waRate}% dari kunjungan
          </p>
        </div>

        {/* KPI 4: Leads Masuk (Lead) */}
        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Leads Masuk
              </p>
              <p className="text-3xl font-sans font-bold text-sky-400 mt-2">
                {totals.Lead}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Konversi form {leadRate}% dari kunjungan
          </p>
        </div>
      </div>

      {/* Charts Grid: Daily Trend + Top 5 Viewed Properties */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Daily Trend AreaChart */}
        <div className="xl:col-span-2 bg-[#0B1513] rounded-2xl border border-white/10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h3 className="font-sans text-base font-bold text-white">
                Tren Harian Pengunjung &amp; Konversi
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Perbandingan PageView, Klik WhatsApp (Contact), dan Leads Masuk
                per hari.
              </p>
            </div>
          </div>

          <div className="w-full h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySeries}
                margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradPageView" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradContact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradLead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A15A" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#C8A15A" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  minTickGap={rangeDays === 30 ? 22 : 8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A1412",
                    borderColor: "rgba(200, 161, 90, 0.35)",
                    borderRadius: "12px",
                    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.5)",
                    fontSize: "12px",
                    color: "#F8FAFC",
                  }}
                  itemStyle={{ color: "#E2E8F0" }}
                  labelStyle={{
                    fontWeight: 700,
                    color: "#C8A15A",
                    marginBottom: "4px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#CBD5E1" }}
                />
                <Area
                  type="monotone"
                  dataKey="PageView"
                  name="Kunjungan (PageView)"
                  stroke="#34D399"
                  strokeWidth={2.4}
                  fill="url(#gradPageView)"
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="Contact"
                  name="Klik WA (Contact)"
                  stroke="#38BDF8"
                  strokeWidth={2.2}
                  fill="url(#gradContact)"
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="Lead"
                  name="Leads Masuk (Lead)"
                  stroke="#C8A15A"
                  strokeWidth={2.4}
                  fill="url(#gradLead)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Most Viewed Properties */}
        <div className="bg-[#0B1513] rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-5">
            <div>
              <h3 className="font-sans text-base font-bold text-white">
                Top 5 Properti Terpopuler
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Berdasarkan event ViewContent ({rangeDays} hari terakhir).
              </p>
            </div>
            <span className="w-9 h-9 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#C8A15A] flex items-center justify-center shrink-0">
              <AwardIcon className="w-4 h-4" />
            </span>
          </div>

          {topProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/14">
              <EyeIcon className="w-7 h-7 text-white/25 mb-2" />
              <p className="text-sm font-semibold text-white/75">
                Belum ada data tayangan properti
              </p>
              <p className="text-xs text-white/45 mt-1">
                Kunjungan ke halaman detail properti akan otomatis tercatat di
                sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {topProperties.map((item, idx) => {
                const widthPercent = Math.max(
                  10,
                  Math.round((item.views / maxTopViews) * 100)
                );

                return (
                  <div key={item.title} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            idx === 0
                              ? "bg-[#C8A15A] text-[#070D0C]"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className="font-semibold text-white/90 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="font-bold text-[#C8A15A] whitespace-nowrap shrink-0">
                        {item.views}x
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPercent}%`,
                          background:
                            idx === 0
                              ? "linear-gradient(90deg, #063D36 0%, #C8A15A 100%)"
                              : "#34D399",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
