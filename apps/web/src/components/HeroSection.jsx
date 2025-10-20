import { useState } from "react";
import { Search, Briefcase, Users } from "lucide-react";

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("job_seeker");

  const handleSearch = (e) => {
    e.preventDefault();
    if (userType === "job_seeker") {
      // Navigate to jobs page with search parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }
      window.location.href = `/jobs?${params.toString()}`;
    } else {
      // Navigate to job seekers page with search parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("query", searchTerm.trim());
      }
      window.location.href = `/job-seekers?${params.toString()}`;
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-white to-pink-50 py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-red-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-1/3 w-18 h-18 bg-pink-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Talent with
            <span className="block text-red-600 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Opportunity
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The premier platform connecting exceptional talent with leading companies. 
            Whether you're seeking your next career opportunity or searching for top talent, 
            we've got you covered.
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="mb-8">
          <div className="inline-flex bg-white p-2 rounded-xl shadow-lg border border-gray-100">
            <button
              onClick={() => setUserType("job_seeker")}
              className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                userType === "job_seeker"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              I'm looking for work
            </button>
            <button
              onClick={() => setUserType("recruiter")}
              className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                userType === "recruiter"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              I'm hiring talent
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={userType === "job_seeker" ? "Job title or keywords" : "Skills or keywords"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 outline-none text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg active:transform active:scale-95"
              >
                {userType === "job_seeker" ? "Search Jobs" : "Search Talent"}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Action Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {userType === "job_seeker" ? (
            <>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Remote Jobs
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Tech Jobs
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Marketing Jobs
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Design Jobs
              </span>
            </>
          ) : (
            <>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Developers
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Designers
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Marketers
              </span>
              <span className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer transition-all">
                Sales
              </span>
            </>
          )}
        </div>

        {/* Trusted By */}
        <p className="text-gray-500 text-sm">
          Trusted by leading companies worldwide
        </p>
      </div>
    </section>
  );
}