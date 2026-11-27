import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";

interface SocialSectionProps {
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
}

export default function SocialSection({
  instagramUrl = DEFAULT_SITE_SETTINGS.instagram_url,
  tiktokUrl = DEFAULT_SITE_SETTINGS.tiktok_url,
  facebookUrl = DEFAULT_SITE_SETTINGS.facebook_url,
}: SocialSectionProps) {
  const cleanInstagram = instagramUrl.trim();
  const cleanTiktok = tiktokUrl.trim();
  const cleanFacebook = facebookUrl.trim();

  if (!cleanInstagram && !cleanTiktok && !cleanFacebook) {
    return null;
  }

  return (
    <section className="social-section" aria-label="Media sosial">
      <div className="social-links">
        {cleanInstagram && (
          <a
            href={cleanInstagram}
            target="_blank"
            rel="noreferrer"
            className="social-link instagram"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.25-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
            </svg>
          </a>
        )}
        {cleanTiktok && (
          <a
            href={cleanTiktok}
            target="_blank"
            rel="noreferrer"
            className="social-link tiktok"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 3c.8 2 2.3 3.2 4.5 3.5v2.7a7.4 7.4 0 0 1-4.5-1.3v6.4A5.7 5.7 0 1 1 8.8 8.8c.4 0 .8 0 1.1.1v2.8a3.2 3.2 0 0 0-1.1-.2 3.2 3.2 0 1 0 3.2 3.1V3h2.5z" />
            </svg>
          </a>
        )}
        {cleanFacebook && (
          <a
            href={cleanFacebook}
            target="_blank"
            rel="noreferrer"
            className="social-link facebook"
            aria-label="Facebook"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 22v-8h2.7l.5-3h-3.2V7.5c0-.9.3-1.5 1.6-1.5H17V3.1c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.1V11H6.5v3h2.5v8h4.5z" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
