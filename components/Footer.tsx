import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({
  settings = DEFAULT_SITE_SETTINGS,
}: FooterProps) {
  const hasInstagram = Boolean(settings.instagram_url?.trim());
  const hasTiktok = Boolean(settings.tiktok_url?.trim());

  return (
    <footer>
      <div className="max-w-5xl mx-auto space-y-3">
        <p className="font-serif text-base font-bold tracking-wider text-[#c8a15a]">
          {settings.company_name}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-xs text-white/80">
          {settings.office_address && <span>📍 {settings.office_address}</span>}
          {settings.office_address && settings.operating_hours && (
            <span className="hidden sm:inline text-[#c8a15a]/60">&bull;</span>
          )}
          {settings.operating_hours && (
            <span>🕒 {settings.operating_hours}</span>
          )}
        </div>

        {(hasInstagram || hasTiktok) && (
          <div className="flex items-center justify-center gap-3 pt-1">
            {hasInstagram && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#c8a15a] text-white hover:text-[#063d36] inline-flex items-center justify-center transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.25-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
                </svg>
              </a>
            )}
            {hasTiktok && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#c8a15a] text-white hover:text-[#063d36] inline-flex items-center justify-center transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M14.5 3c.8 2 2.3 3.2 4.5 3.5v2.7a7.4 7.4 0 0 1-4.5-1.3v6.4A5.7 5.7 0 1 1 8.8 8.8c.4 0 .8 0 1.1.1v2.8a3.2 3.2 0 0 0-1.1-.2 3.2 3.2 0 1 0 3.2 3.1V3h2.5z" />
                </svg>
              </a>
            )}
          </div>
        )}

        <p className="pt-2 text-xs text-[#c8a15a]/85">
          &copy; 2026 {settings.company_name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
