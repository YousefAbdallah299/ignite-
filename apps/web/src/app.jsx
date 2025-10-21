import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Main pages
import Home from './app/page.jsx';
import About from './app/about/page.jsx';
import AccountRegister from './app/account/register/page.jsx';
import AccountSignin from './app/account/signin/page.jsx';
import AccountSignup from './app/account/signup/page.jsx';
import Admin from './app/admin/page.jsx';
import AppliedJobs from './app/applied-jobs/page.jsx';
import Blog from './app/blog/page.jsx';
import CandidatesId from './app/candidates/id/page.jsx';
import Courses from './app/courses/page.jsx';
import CoursesId from './app/courses/id/page.jsx';
import CoursesIdLearn from './app/courses/id/learn/page.jsx';
import Help from './app/help/page.jsx';
import JobSeekers from './app/job-seekers/page.jsx';
import Jobs from './app/jobs/page.jsx';
import JobsId from './app/jobs/id/page.jsx';
import JobsIdApply from './app/jobs/id/apply/page.jsx';
import JobsIdCancel from './app/jobs/id/cancel/page.jsx';
import MyCourses from './app/my-courses/page.jsx';
import MyJobs from './app/my-jobs/page.jsx';
import MyOffers from './app/my-offers/page.jsx';
import Offers from './app/offers/page.jsx';
import OffersId from './app/offers/id/page.jsx';
import Payment from './app/payment/page.jsx';
import PaymentFailed from './app/payment-failed/page.jsx';
import PaymentSuccess from './app/payment-success/page.jsx';
import Pricing from './app/pricing/page.jsx';
import Privacy from './app/privacy/page.jsx';
import Profile from './app/profile/page.jsx';
import Subscribe from './app/subscribe/page.jsx';
import Terms from './app/terms/page.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/account/register" element={<AccountRegister />} />
            <Route path="/account/signin" element={<AccountSignin />} />
            <Route path="/account/signup" element={<AccountSignup />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/applied-jobs" element={<AppliedJobs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/candidates/:id" element={<CandidatesId />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CoursesId />} />
            <Route path="/courses/:id/learn" element={<CoursesIdLearn />} />
            <Route path="/help" element={<Help />} />
            <Route path="/job-seekers" element={<JobSeekers />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobsId />} />
            <Route path="/jobs/:id/apply" element={<JobsIdApply />} />
            <Route path="/jobs/:id/cancel" element={<JobsIdCancel />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/my-offers" element={<MyOffers />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/:id" element={<OffersId />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/terms" element={<Terms />} />
        </Routes>
    );
}
