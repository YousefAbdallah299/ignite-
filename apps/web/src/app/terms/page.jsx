import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 initial-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceptance of Terms</h2>
            <p>By using Ignite, you agree to these terms and our Privacy Policy.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Use of Service</h2>
            <p>You will not misuse the platform or post illegal, misleading, or harmful content.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and activities under it.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Content</h2>
            <p>You retain ownership of your content but grant us a license to operate the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Termination</h2>
            <p>We may suspend or terminate accounts for violations of these terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
            <p>Questions? Email <a href="mailto:support@ignite.com" className="text-red-600">support@ignite.com</a>.</p>
          </section>
        </div>
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}


