import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Check, Lock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';

export default function SubscribePage() {
  const navigate = useNavigate();
  const { user, isRecruiter, isAuthenticated, loading } = useAuthAPI();
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const plans = [
    {
      id: 'professional',
      name: 'Recruiter Subscription',
      price: 2900, // Price in cents (29.00 EGP)
      priceDisplay: '29 EGP',
    },
  ];
}
