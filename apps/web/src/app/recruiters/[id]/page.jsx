'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Calendar, CreditCard, Shield, User, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageFadeIn from '@/components/PageFadeIn';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { recruitersAPI } from '@/utils/apiClient';

export default function RecruiterProfilePage() {
  const { isAdmin } = useAuthAPI();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const id = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        let data;
        try {
          // Primary: treat route param as recruiter profile id
          data = await recruitersAPI.getRecruiterById(id);
        } catch (primaryError) {
          // Fallback: treat route param as user id
          data = await recruitersAPI.getRecruiterByUserId(id);
        }
        setProfile(data);
      } catch (error) {
        console.error('Failed to load recruiter profile:', error);
        toast.error(error.message || 'Failed to load recruiter profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      load();
    } else if (isAdmin === false) {
      setLoading(false);
    }
  }, [id, isAdmin]);

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Not available');

  return (
    <PageFadeIn className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isAdmin ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">This page is only accessible to administrators.</p>
          </div>
        ) : loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">Loading recruiter profile...</div>
        ) : !profile ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">Recruiter profile not found.</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{profile.companyName || 'Recruiter Profile'}</h1>
                  <p className="text-sm text-gray-500">Recruiter Profile #{profile.id}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow icon={User} label="User ID" value={profile.userId} />
                <InfoRow icon={User} label="First Name" value={profile.firstName} />
                <InfoRow icon={User} label="Last Name" value={profile.lastName} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Mail} label="Company Email" value={profile.businessEmail} />
                <InfoRow icon={Shield} label="Status" value={profile.status || 'Unknown'} />
                <InfoRow icon={Calendar} label="Subscription Start" value={formatDate(profile.subscriptionStartDate)} />
                <InfoRow icon={CreditCard} label="Subscription End" value={formatDate(profile.subscriptionEndDate)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </PageFadeIn>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="text-gray-900 font-medium break-words">{String(value ?? 'Not available')}</div>
    </div>
  );
}

