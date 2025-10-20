import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, User, Briefcase, Users, BookOpen, FileText, Settings, LogOut, ChevronDown, PlusCircle, List, CheckSquare, Building2, GraduationCap, HelpCircle, DollarSign, Shield, Info } from "lucide-react";
import { useAuthAPI } from "@/hooks/useAuthAPI";

export default function Header() {
  const { user, logout, isAuthenticated, isRecruiter, isAdmin, isCandidate } = useAuthAPI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [pathname, setPathname] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const dropdownRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);

  // Track active route for highlighting
  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => {
      window.removeEventListener('popstate', update);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target)) {
        setJobsDropdownOpen(false);
      }
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setCoursesDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const linkClass = (href) =>
    `${pathname === href ? 'text-red-600 font-semibold bg-red-50 rounded-lg' : 'text-gray-500'} hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors`;
  const homeClass = pathname === '/' ? 'text-red-600 font-semibold bg-red-50 rounded-lg' : 'text-gray-900';
  
  // Get first name from user data
  const getFirstName = () => {
    if (!user) return 'User';
    
    // Try different field names for first name
    if (user.firstName) return user.firstName;
    if (user.first_name) return user.first_name;
    
    // Try to extract from full name
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      return nameParts[0] || 'User';
    }
    
    // Fallback to email username (but make it more user-friendly)
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      // If it looks like a real name (not just numbers/random chars), use it
      if (emailUsername.length > 2 && /[a-zA-Z]/.test(emailUsername)) {
        return emailUsername;
      }
    }
    
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <span className="ml-2 text-2xl font-bold text-gray-900">Ignite</span>
              </a>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <a href="/" className={`${homeClass} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
                Home
              </a>
              <a href="/blog" className={linkClass('/blog')}>
                Feed
              </a>
              
              {/* Jobs Dropdown */}
              <div className="relative" ref={jobsDropdownRef}>
                <button
                  onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
                  className={`${pathname.startsWith('/jobs') || pathname.startsWith('/applied-jobs') || pathname.startsWith('/my-jobs') ? 'text-red-600 font-semibold' : 'text-gray-500'} hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1`}
                >
                  Jobs
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {jobsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <a href="/jobs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setJobsDropdownOpen(false)}>
                      <Search className="w-4 h-4 mr-3 text-gray-400" />
                      Browse Jobs
                    </a>
                    {isCandidate && (
                      <a href="/applied-jobs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setJobsDropdownOpen(false)}>
                        <CheckSquare className="w-4 h-4 mr-3 text-gray-400" />
                        My Applications
                      </a>
                    )}
                    {isRecruiter && (
                      <>
                        <a href="/jobs/create" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setJobsDropdownOpen(false)}>
                          <PlusCircle className="w-4 h-4 mr-3 text-gray-400" />
                          Post a Job
                        </a>
                        <a href="/my-jobs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setJobsDropdownOpen(false)}>
                          <List className="w-4 h-4 mr-3 text-gray-400" />
                          My Posted Jobs
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Courses Dropdown */}
              <div className="relative" ref={coursesDropdownRef}>
                <button
                  onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                  className={`${pathname.startsWith('/courses') || pathname.startsWith('/my-courses') ? 'text-red-600 font-semibold' : 'text-gray-500'} hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1`}
                >
                  Courses
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {coursesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <a href="/courses" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setCoursesDropdownOpen(false)}>
                      <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                      Browse Courses
                    </a>
                    {isCandidate && (
                      <a href="/my-courses" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setCoursesDropdownOpen(false)}>
                        <GraduationCap className="w-4 h-4 mr-3 text-gray-400" />
                        My Enrolled Courses
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {(isRecruiter || isAdmin) && (
                <a href="/job-seekers" className={linkClass('/job-seekers')}>
                  Job Seekers
                </a>
              )}
              
              {/* More Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`${pathname.startsWith('/about') || pathname.startsWith('/help') || pathname.startsWith('/pricing') || pathname.startsWith('/terms') || pathname.startsWith('/privacy') ? 'text-red-600 font-semibold' : 'text-gray-500'} hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1`}
                >
                  More
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <a href="/about" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setMoreDropdownOpen(false)}>
                      <Info className="w-4 h-4 mr-3 text-gray-400" />
                      About Us
                    </a>
                    <a href="/pricing" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setMoreDropdownOpen(false)}>
                      <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                      Pricing
                    </a>
                    <a href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setMoreDropdownOpen(false)}>
                      <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                      Help Center
                    </a>
                    <div className="border-t border-gray-200 my-1"></div>
                    <a href="/terms" className="flex items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setMoreDropdownOpen(false)}>
                      <Shield className="w-4 h-4 mr-3 text-gray-400" />
                      Terms
                    </a>
                    <a href="/privacy" className="flex items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setMoreDropdownOpen(false)}>
                      <Shield className="w-4 h-4 mr-3 text-gray-400" />
                      Privacy
                    </a>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Right side buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <a href="/account/signin" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </a>
                <a href="/account/register" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Started
                </a>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getFirstName().charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{getFirstName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {isAdmin ? null : (
                      isRecruiter ? (
                        <>
                          <a
                            href="/my-offers"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </a>
                          <a
                            href="/my-jobs"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            My Jobs
                          </a>
                        </>
                      ) : (
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </a>
                      )
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/" className={`${pathname === '/' ? 'text-red-600 font-semibold' : 'text-gray-900'} hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium`}>
              Home
            </a>
            <a href="/blog" className={`${pathname === '/blog' ? 'text-red-600 font-semibold' : 'text-gray-500'} hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium`}>
              Feed
            </a>
            
            {/* Jobs Section */}
            <div className="pl-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Jobs</div>
              <a href="/jobs" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </a>
              {isCandidate && (
                <a href="/applied-jobs" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  My Applications
                </a>
              )}
              {isRecruiter && (
                <>
                  <a href="/jobs/create" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Post a Job
                  </a>
                  <a href="/my-jobs" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                    <List className="w-4 h-4 mr-2" />
                    My Posted Jobs
                  </a>
                </>
              )}
            </div>
            
            {/* Courses Section */}
            <div className="pl-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Courses</div>
              <a href="/courses" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </a>
              {isCandidate && (
                <a href="/my-courses" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  My Enrolled Courses
                </a>
              )}
            </div>
            
            {(isRecruiter || isAdmin) && (
              <a href="/job-seekers" className={`${pathname === '/job-seekers' ? 'text-red-600 font-semibold' : 'text-gray-500'} hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium`}>
                Job Seekers
              </a>
            )}
            
            {/* More Section */}
            <div className="pl-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">More</div>
              <a href="/about" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                <Info className="w-4 h-4 mr-2" />
                About Us
              </a>
              <a href="/pricing" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing
              </a>
              <a href="/help" className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-sm font-medium">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-2 space-y-1">
                {!isAuthenticated ? (
                  <>
                    <a href="/account/signin" className="text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                      Sign In
                    </a>
                    <a href="/account/register" className="bg-red-600 hover:bg-red-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-center">
                      Get Started
                    </a>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getFirstName().charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-700">
                        Welcome, {getFirstName()}
                      </div>
                    </div>
                    {isAdmin ? null : (
                      isRecruiter ? (
                        <>
                          <a
                            href="/my-offers"
                            className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </a>
                          <a
                            href="/my-jobs"
                            className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            My Jobs
                          </a>
                        </>
                      ) : (
                        <a
                          href="/profile"
                          className="flex items-center text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </a>
                      )
                    )}
                    <button
                      onClick={logout}
                      className="text-gray-500 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}