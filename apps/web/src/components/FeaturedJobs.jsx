import { MapPin, Clock, DollarSign, Users, ArrowRight } from "lucide-react";

const featuredJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Solutions Inc.",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $150k",
    posted: "2 days ago",
    applicants: 45,
    featured: true,
    tags: ["React", "Node.js", "Python"],
    description: "We are seeking a highly skilled Software Engineer to join our innovative team."
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Creative Labs",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$80k - $100k",
    posted: "1 day ago",
    applicants: 28,
    featured: true,
    tags: ["Figma", "Sketch", "Design Systems"],
    description: "Join our design team to create beautiful and intuitive user experiences."
  },
  {
    id: 3,
    title: "Data Analyst (Contract)",
    company: "Insight Analytics",
    logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Remote",
    type: "Contract",
    salary: "$50 - $70/hr",
    posted: "3 days ago",
    applicants: 62,
    featured: false,
    tags: ["SQL", "Python", "Tableau"],
    description: "Help us uncover valuable insights from complex datasets."
  },
  {
    id: 4,
    title: "Marketing Manager",
    company: "Growth Co",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90k - $110k",
    posted: "1 week ago",
    applicants: 33,
    featured: false,
    tags: ["SEO", "Content Marketing", "Analytics"],
    description: "Lead marketing initiatives and drive growth for our expanding company."
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    logo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$110k - $140k",
    posted: "4 days ago",
    applicants: 19,
    featured: true,
    tags: ["AWS", "Docker", "Kubernetes"],
    description: "Build and maintain scalable cloud infrastructure for our growing platform."
  },
  {
    id: 6,
    title: "Product Manager",
    company: "InnovateTech",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=100&h=100&q=80",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$100k - $130k",
    posted: "5 days ago",
    applicants: 41,
    featured: false,
    tags: ["Product Strategy", "Analytics", "Agile"],
    description: "Drive product vision and strategy for our innovative technology solutions."
  }
];

function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group relative overflow-hidden">
      {/* Featured Badge */}
      {job.featured && (
        <div className="absolute top-4 right-4">
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Job
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
            {job.title}
          </h3>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            {job.type}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <DollarSign className="w-4 h-4" />
            {job.salary}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            {job.applicants} applicants
          </div>
          <div className="text-gray-400 text-sm">
            {job.posted}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/jobs/${job.id}`} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm text-center">
            Apply Now
          </a>
          <a href={`/jobs/${job.id}`} className="flex-1 border border-red-600 text-red-700 hover:bg-red-50 py-2.5 rounded-lg font-semibold text-sm text-center">
            View Job
          </a>
        </div>
      </div>

      {/* Hover Effect (non-interactive overlay) */}
      <div className="pointer-events-none absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
    </div>
  );
}

export default function FeaturedJobs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Job Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover your next career opportunity with our carefully curated job listings from top companies
          </p>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a href="/jobs" className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg group">
            View All Jobs
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}