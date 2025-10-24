import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="initial-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Center</h1>
          <p className="text-gray-700 mb-8">Find answers to common questions about using Ignite as a job seeker or recruiter.</p>
        </div>

        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Seekers</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                How do I apply to a job?
                <div className="text-sm text-gray-600">Open a job and click “Apply Now”. You may be asked for a resume URL and basic details.</div>
              </li>
              <li>
                How do I update my profile?
                <div className="text-sm text-gray-600">Go to My Profile to edit your title, summary, resume URL, and availability.</div>
              </li>
            </ul>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Recruiters</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                How do I browse candidates?
                <div className="text-sm text-gray-600">Use the Job Seekers page to filter by skills, location, and experience.</div>
              </li>
              <li>
                How do I send an offer?
                <div className="text-sm text-gray-600">Open a candidate profile and click “Send Offer”.</div>
              </li>
            </ul>
          </section>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Support</h2>
          <p className="text-gray-700">Can't find what you need? Email us at <a href="mailto:support@ignite.com" className="text-red-600">support@ignite.com</a>.</p>
          </section>
        </RevealOnScroll>
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}


