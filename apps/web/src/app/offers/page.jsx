'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOffers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/offers?page=${page}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setOffers(data.offers);
      setPagination(data.pagination);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/offers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Failed');
      await fetchOffers(pagination.page || 1);
    } catch (_e) {
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="initial-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Offers</h1>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : offers.length === 0 ? (
          <div className="text-gray-600">No offers yet.</div>
        ) : (
          <RevealOnScroll>
            <div className="space-y-4">
            {offers.map((o) => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Offer #{o.id}</div>
                  <div className="text-sm text-gray-600">Status: {o.status}</div>
                </div>
                <div className="flex gap-2">
                  <button disabled={updatingId === o.id} onClick={() => updateStatus(o.id, 'accepted')} className="px-4 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-60">Accept</button>
                  <button disabled={updatingId === o.id} onClick={() => updateStatus(o.id, 'declined')} className="px-4 py-2 rounded-lg border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60">Decline</button>
                </div>
              </div>
            ))}
            </div>
          </RevealOnScroll>
        )}
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}


