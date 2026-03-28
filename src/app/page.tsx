import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import Tokenomics from "@/components/Tokenomics";
import Roadmap from "@/components/Roadmap";
import HowToBuy from "@/components/HowToBuy";
import WarRoom from "@/components/WarRoom";
import EcosystemVenture from "@/components/EcosystemVenture";
import Footer from "@/components/Footer";
import HallOfFame from "@/components/HallOfFame";
import RedactedDoc from "@/components/RedactedDoc";
import RedactedAssets from "@/components/RedactedAssets";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden page-enter">
      <Hero />
      <VideoSection />
      <RedactedDoc />
      <WarRoom />
      <EcosystemVenture />
      <Tokenomics />
      <RedactedAssets />
      <HowToBuy />
      <Roadmap />
      <HallOfFame />
      <Footer />
    </main>
  );
}
