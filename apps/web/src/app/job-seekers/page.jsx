import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Check, Lock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function JobSeekersPage() {
  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="initial-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Seekers</h1>
          <p className="text-gray-600 mb-8">Find your dream job with our platform</p>
        </div>

        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Job Seekers</h2>
            <p className="text-gray-600">
              This page is under construction. Job seekers can browse and apply for jobs.
            </p>
          </div>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
