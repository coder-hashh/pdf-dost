import { HeroSection } from "@/components/home/hero-section";
import { ToolsGrid } from "@/components/home/tools-grid";
import { FeaturesSection } from "@/components/home/features-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToolsGrid />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
