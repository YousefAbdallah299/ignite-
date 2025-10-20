import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 initial-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Overview</h2>
            <p>We collect the minimum data necessary to provide our services, including account details and activity related to jobs, offers, and courses.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data We Collect</h2>
            <ul className="list-disc pl-6">
              <li>Account information (email, role)</li>
              <li>Profile data (title, summary, resume URL)</li>
              <li>Usage data (jobs applied, offers sent)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Data</h2>
            <p>To operate the platform, improve matching, and communicate important updates. We do not sell personal data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Choices</h2>
            <p>You may update your profile anytime and request account deletion by contacting support.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
            <p>Questions? Email <a href="mailto:privacy@ignite.com" className="text-red-600">privacy@ignite.com</a>.</p>
          </section>
        </div>
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}


