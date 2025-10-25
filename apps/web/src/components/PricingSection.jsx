import React from 'react';
import { Check, Star, Users, Building2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthAPI } from '@/hooks/useAuthAPI';

const pricingPlans = [
  {
    id: 1,
    name: "Job Seeker",
    price: "Free",
    period: "forever",
    description: "Perfect for professionals looking for their next opportunity",
    icon: Users,
    features: [
      "Browse unlimited job listings",
      "Apply to jobs directly",
      "Create professional profile",
      "Get job recommendations",
      "View blogs",
      "Email support"
    ],
    cta: "Get Started Free",
    ctaLink: "/account/signup?role=candidate",
    popular: false,
    color: "blue"
  },
  {
    id: 2,
    name: "Recruiter",
    price: "29 EGP",
    period: "per month",
    description: "Ideal for companies and recruiters seeking top talent",
    icon: Building2,
    features: [
      "Post unlimited job listings",
      "Access candidate database",
      "Advanced search filters",
      "Send offers to candidates",
      "Check verified skills",
      "View blogs",
      "Priority support"
    ],
    cta: "Subscribe Now",
    ctaLink: "/account/signup?role=recruiter",
    popular: true,
    color: "red"
  }
];

export default function PricingSection() {
  const { isAuthenticated, user, isRecruiter, isCandidate } = useAuthAPI();
  const navigate = useNavigate();
  
  const handleCTAClick = (plan) => {
    // If user is already signed in
    if (isAuthenticated) {
      // Check if they already have the appropriate role
      if (plan.name === 'Job Seeker' && isCandidate) {
        navigate('/profile');
        return;
      }
      if (plan.name === 'Recruiter' && isRecruiter) {
        navigate('/payment');
        return;
      }
      // If they want to subscribe to recruiter but aren't one
      if (plan.name === 'Recruiter' && !isRecruiter) {
        navigate('/payment');
        return;
      }
      // Job seeker plan - already signed in
      navigate('/profile');
    } else {
      // Not signed in - go to signup
      navigate(plan.ctaLink);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPopular 
                    ? 'border-red-500 scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      plan.color === 'red' ? 'bg-red-100' :
                      plan.color === 'blue' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${
                        plan.color === 'red' ? 'text-red-600' :
                        plan.color === 'blue' ? 'text-blue-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {plan.period}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCTAClick(plan)}
                    className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isPopular
                        ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg'
                    }`}
                  >
                    {isAuthenticated 
                      ? (plan.name === 'Job Seeker' && isCandidate ? 'Go to Profile' :
                         plan.name === 'Recruiter' && isRecruiter ? 'Manage Subscription' :
                         plan.cta)
                      : plan.cta
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            All plans include our core features and are backed by our satisfaction guarantee.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
