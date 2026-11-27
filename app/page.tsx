import SplashScreen from "@/components/SplashScreen";
import HeroSection from "@/components/HeroSection";
import PropertySearchBar from "@/components/PropertySearchBar";
import AboutSection from "@/components/AboutSection";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import StatsSection from "@/components/StatsSection";
import ContactSection from "@/components/ContactSection";
import SocialSection from "@/components/SocialSection";
import {
  getFeaturedProperties,
  getPropertyTypeOptions,
} from "@/lib/properties";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HomePage() {
  const [featuredProperties, typeOptions, siteSettings] = await Promise.all([
    getFeaturedProperties(),
    getPropertyTypeOptions(),
    getSiteSettings(),
  ]);

  return (
    <>
      <SplashScreen />
      <HeroSection />
      <PropertySearchBar typeOptions={typeOptions} />
      <AboutSection />
      <FeaturedPropertiesSection properties={featuredProperties} />
      <StatsSection />
      <ContactSection settings={siteSettings} />
      <SocialSection
        instagramUrl={siteSettings.instagram_url}
        tiktokUrl={siteSettings.tiktok_url}
      />
    </>
  );
}
