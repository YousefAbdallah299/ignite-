import { ArrowRight, MapPin, Users } from "lucide-react";

const topCompanies = [
  {
    id: 1,
    name: "Tech Solutions Inc.",
    description: "Leading technology company specializing in innovative software solutions",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80",
    location: "San Francisco, CA",
    industry: "Technology",
    employees: "500-1000",
    activeJobs: 12,
    featured: true
  },
  {
    id: 2,
    name: "Insight Analytics",
    description: "Data-driven insights and analytics solutions for businesses",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Austin, TX",
    industry: "Data Science",
    employees: "100-500",
    activeJobs: 8,
    featured: true
  },
  {
    id: 3,
    name: "BuildRight Construction",
    description: "Premier construction and project management company",
    logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Chicago, IL",
    industry: "Construction",
    employees: "200-500",
    activeJobs: 6,
    featured: true
  },
  {
    id: 4,
    name: "Summit Search Partners",
    description: "A leading global executive search firm specializing in C-suite placements",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    location: "New York, NY",
    industry: "Executive Search",
    employees: "50-100",
    activeJobs: 15,
    featured: false
  },
  {
    id: 5,
    name: "Healthcare Talent Connect",
    description: "Healthcare Talent Connect specializes in recruiting healthcare professionals",
    logo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Boston, MA",
    industry: "Healthcare Recruitment",
    employees: "100-200",
    activeJobs: 22,
    featured: false
  },
  {
    id: 6,
    name: "Finance Forward Staffing",
    description: "Expert recruitment services for accounting, finance, and banking professionals",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Miami, FL",
    industry: "Finance & Accounting",
    employees: "150-300",
    activeJobs: 18,
    featured: false
  }
];

function CompanyCard({ company }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group relative overflow-hidden">
      {/* Featured Badge */}
      {company.featured && (
        <div className="absolute top-4 right-4">
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
            Top Recruiter
          </span>
        </div>
      )}

      {/* Company Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-gray-900 group-hover:text-red-600 transition-colors mb-1">
            {company.name}
          </h3>
          <p className="text-gray-500 text-sm font-medium mb-2">{company.industry}</p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            {company.location}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {company.description}
      </p>

      {/* Company Stats */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="font-semibold text-gray-900 text-sm">{company.employees}</div>
          <div className="text-gray-500 text-xs">Employees</div>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <div className="font-semibold text-red-600 text-sm">{company.activeJobs}</div>
          <div className="text-gray-500 text-xs">Open Jobs</div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-semibold transition-all group-hover:bg-red-600 group-hover:text-white flex items-center justify-center gap-2">
        View Company
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
    </div>
  );
}

export default function TopCompanies() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Top Recruiting Companies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover opportunities with industry-leading companies that are actively hiring top talent
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {topCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg group">
            View All Companies
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}