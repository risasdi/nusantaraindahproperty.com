import SplashScreen from "@/components/SplashScreen";
import HeroSection from "@/components/HeroSection";
import PropertySearchBar from "@/components/PropertySearchBar";
import AboutSection from "@/components/AboutSection";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import StatsSection from "@/components/StatsSection";
import ContactSection from "@/components/ContactSection";
import SocialSection from "@/components/SocialSection";

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <HeroSection />
      <PropertySearchBar />
      <AboutSection />
      <FeaturedPropertiesSection />
      <StatsSection />
      <ContactSection />
      <SocialSection />
    </>
  );
}
