import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 initial-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-gray-700 leading-relaxed mb-6">
          Ignite is a modern platform connecting job seekers and recruiters through a streamlined experience. We help candidates discover opportunities and enable recruiters to find the right talent faster.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-700">Empower people to achieve their career goals while enabling companies to build world-class teams.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">What We Offer</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Powerful job search and filtering</li>
              <li>Anonymous candidate browsing for recruiters</li>
              <li>One-click job applications</li>
              <li>Offers management and messaging</li>
              <li>Learning resources and detailed courses</li>
            </ul>
          </div>
        </div>
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}


