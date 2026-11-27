import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { PROPERTIES } from "@/data/properties";
import { formatRupiah } from "@/lib/format";
import type { DbProperty } from "@/lib/properties";
import {
  DEFAULT_SITE_SETTINGS,
  getFreshSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

interface IncomingChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: IncomingChatMessage[];
}

// Primary ultra-fast non-thinking model first so replies arrive swiftly & uncut
const DEFAULT_CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
] as const;

const MODEL_TIMEOUT_MS = 7500;
const PROPERTIES_CACHE_TTL_MS = 60_000;

interface CachedProperties {
  expiresAt: number;
  propertiesLines: string;
}

let cachedProperties: CachedProperties | null = null;

function getCandidateModels(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured) return [...DEFAULT_CANDIDATE_MODELS];
  return [
    configured,
    ...DEFAULT_CANDIDATE_MODELS.filter((m) => m !== configured),
  ].slice(0, 2);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function buildFallbackReply(settings: SiteSettings): string {
  return `Waduh, maaf banget ya Kak 🙏 Asisten AI kami lagi agak padat nih sekarang. Biar Kakak nggak nunggu lama, langsung klik tombol **WhatsApp** hijau di atas ya — tim marketing ${settings.company_name} siap bantu info rumah DP 0% & jadwal survei langsung!`;
}

async function callModelWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`Model request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  }
}

async function fetchCompactProperties(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await supabase
        .from("properties")
        .select(
          "title, location, price, status, bedrooms, bathrooms, land_area, building_area, features"
        )
        .order("created_at", { ascending: true });

      const rows = (!error && Array.isArray(data) ? data : []) as DbProperty[];

      if (rows.length > 0) {
        return rows
          .map((p) => {
            const topSpecs = Array.isArray(p.features)
              ? p.features.filter(Boolean).slice(0, 4).join(", ")
              : "";
            const base = `- ${p.title || "Properti"} | ${p.location || "Bandung"} | ${formatRupiah(Number(p.price) || 0)} | ${p.status || "DIJUAL"} | ${p.bedrooms ?? 2}KT ${p.bathrooms ?? 1}KM LB${p.building_area ?? 36}/LT${p.land_area ?? 60}`;
            return topSpecs ? `${base} | ${topSpecs}` : base;
          })
          .join("\n");
      }
    } catch (err) {
      console.error("Chat API properties fetch fallback:", err);
    }
  }

  return PROPERTIES.map(
    (p) =>
      `- ${p.name} | ${p.location} | ${formatRupiah(p.price)} | ${p.status} | ${p.specs.join(", ")}`
  ).join("\n");
}

async function getChatContext(): Promise<{
  settings: SiteSettings;
  propertiesLines: string;
}> {
  const now = Date.now();
  const propertiesPromise =
    cachedProperties && cachedProperties.expiresAt > now
      ? Promise.resolve(cachedProperties.propertiesLines)
      : fetchCompactProperties().then((lines) => {
          cachedProperties = {
            expiresAt: Date.now() + PROPERTIES_CACHE_TTL_MS,
            propertiesLines: lines,
          };
          return lines;
        });

  // Always read site_settings fresh so ai_knowledge updates from /admin/settings take effect in real-time
  const [settings, propertiesLines] = await Promise.all([
    getFreshSiteSettings().catch(() => DEFAULT_SITE_SETTINGS),
    propertiesPromise,
  ]);

  return {
    settings: settings ?? DEFAULT_SITE_SETTINGS,
    propertiesLines,
  };
}

function buildCompactSystemInstruction(
  settings: SiteSettings,
  propertiesLines: string
): string {
  const knowledgeText = settings.ai_knowledge?.trim() ?? "";
  const knowledgeSection = knowledgeText
    ? `\n\nInformasi Tambahan, Promo & FAQ Perusahaan:\n${knowledgeText.slice(0, 2000)}`
    : `\n\nInformasi Tambahan, Promo & FAQ Perusahaan:\n- Promo standar: KPR DP 0% & Bebas Biaya Legalitas (cukup Booking Fee). Bank rekanan: BSI, BCA, Mandiri, BTN.`;

  return `Kamu Asisten Virtual ${settings.company_name}.
Aturan:
- Gaya santai, ramah, natural ala Gen Z (sapa "Kak", tidak kaku, sopan, max 1-2 emoji).
- Jawab ringkas 3-5 kalimat atau poin pendek, akhiri dengan kalimat utuh.
- Prioritaskan informasi dari Katalog Properti, Info Kontak, dan Informasi Tambahan, Promo & FAQ Perusahaan di bawah ini; jangan mengarang harga, stok, atau promo di luar data tersebut.
- Unit berstatus TERJUAL sebut sudah terjual & tawarkan unit yang masih DIJUAL.
- Arahkan Kakak yang minat survei/KPR ke Form Konsultasi atau tombol WhatsApp di atas.

Info Kontak:
- Perusahaan: ${settings.company_name} | WA: ${settings.whatsapp_number} | Kantor: ${settings.office_address} | Jam: ${settings.operating_hours}
- Suku bunga simulasi KPR (/kpr): ${settings.kpr_interest_rate}%/tahun.${knowledgeSection}

Katalog Properti:
${propertiesLines}`;
}

export async function POST(request: Request) {
  const isDev = process.env.NODE_ENV !== "production";
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const { settings, propertiesLines } = await getChatContext();

  if (!apiKey) {
    return NextResponse.json(
      {
        reply: buildFallbackReply(settings),
        ...(isDev
          ? {
              debugError:
                "Environment variable GEMINI_API_KEY is missing or empty.",
            }
          : {}),
      },
      { status: 200 }
    );
  }

  try {
    const body = (await request.json()) as ChatRequestBody;
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];

    const sanitizedMessages = rawMessages
      .filter(
        (m): m is IncomingChatMessage =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-6)
      .map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content.trim().slice(0, 600) }],
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const firstUserIdx = sanitizedMessages.findIndex((m) => m.role === "user");
    const contents =
      firstUserIdx >= 0 ? sanitizedMessages.slice(firstUserIdx) : [];

    if (contents.length === 0) {
      return NextResponse.json(
        { error: "Pesan pengguna tidak ditemukan." },
        { status: 400 }
      );
    }

    const systemInstruction = buildCompactSystemInstruction(
      settings,
      propertiesLines
    );

    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = getCandidateModels();
    let responseText = "";
    let lastModelError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const response = await callModelWithTimeout(
          ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.5,
              maxOutputTokens: 450,
            },
          }),
          MODEL_TIMEOUT_MS
        );

        responseText = response.text?.trim() ?? "";
        if (responseText) {
          lastModelError = null;
          break;
        }
      } catch (modelErr) {
        lastModelError = modelErr;
        console.warn(
          `Chat API model "${modelName}" failed/timed out, trying next candidate:`,
          getErrorMessage(modelErr)
        );
      }
    }

    if (!responseText) {
      console.error("Chat API error (all models failed):", lastModelError);
      return NextResponse.json(
        {
          reply: buildFallbackReply(settings),
          ...(isDev && lastModelError
            ? { debugError: getErrorMessage(lastModelError) }
            : {}),
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: responseText }, { status: 200 });
  } catch (error) {
    console.error("Chat API error:", error);
    const rawDetail = getErrorMessage(error);

    return NextResponse.json(
      {
        reply: buildFallbackReply(settings),
        ...(isDev ? { debugError: rawDetail } : {}),
      },
      { status: 200 }
    );
  }
}
