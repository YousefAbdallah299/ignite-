import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import TalentedProfessionals from "@/components/TalentedProfessionals";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { useAuthAPI } from "@/hooks/useAuthAPI";

export default function HomePage() {
  const { user, isAuthenticated, isAdmin, isRecruiter, isCandidate } = useAuthAPI();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <Header />

      {/* Hero Section with Search - fades in immediately on page load */}
      <div className="initial-fade-in">
        <HeroSection />
      </div>

      {/* Statistics Section - fades in when scrolling */}
      <RevealOnScroll>
        <StatsSection />
      </RevealOnScroll>

      {/* Pricing Section - fades in when scrolling */}
      <RevealOnScroll>
        <PricingSection />
      </RevealOnScroll>

      {/* Talented Professionals - Role-based visibility */}
      {/* Show for recruiters and admins only */}
      {(isRecruiter || isAdmin) && (
        <RevealOnScroll>
          <TalentedProfessionals />
        </RevealOnScroll>
      )}

      {/* Newsletter Signup - fades in when scrolling */}
      <RevealOnScroll>
        <NewsletterSection />
      </RevealOnScroll>

      {/* Footer - fades in when scrolling */}
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>

      {/* Global styles and fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
