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
  return (
    <footer className="py-8 px-5">
      <div className="max-w-4xl mx-auto space-y-1.5 text-center">
        <p className="font-serif text-sm sm:text-base font-bold tracking-wider text-[#c8a15a]">
          {settings.company_name}
        </p>
        <p className="text-xs text-[#c8a15a]/80">
          &copy; 2026 {settings.company_name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
