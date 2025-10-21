import React from 'react';
import { Users, Building2, TrendingUp, Award } from "lucide-react";

const stats = [
  {
    id: 1,
    icon: Users,
    number: "Thousands",
    label: "Job Seekers",
    description: "Active professionals seeking opportunities"
  },
  {
    id: 2,
    icon: Building2,
    number: "Hundreds",
    label: "Companies",
    description: "Leading companies trust our platform"
  },
  {
    id: 3,
    icon: TrendingUp,
    number: "High",
    label: "Success Rate",
    description: "Successful job placements and hires"
  },
  {
    id: 4,
    icon: Award,
    number: "Diverse",
    label: "Industries",
    description: "Covering diverse industry sectors"
  }
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join a thriving community of professionals and companies that are shaping the future of work
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="text-center group">
                <div className="relative mb-6">
                  {/* Background circle */}
                  <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center mx-auto group-hover:from-red-100 group-hover:to-pink-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}