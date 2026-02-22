'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { adsAPI } from '@/utils/apiClient';

const SHOW_DELAY_MS = 2000;
const ROTATION_MS = 7000;

let nextInstanceId = 1;

const createStore = () => ({
  ads: [],
  isLoading: false,
  hasShown: false,
  rotationStep: 0,
  listeners: new Set(),
  leaders: { left: null, right: null },
  mounted: { left: new Set(), right: new Set() },
  closed: { left: false, right: false },
  showTimer: null,
  rotationTimer: null,
});

const store = createStore();

function emit() {
  store.listeners.forEach((listener) => listener());
}

function normalizeAd(rawAd = {}) {
  const image =
    rawAd.imageUrl ||
    rawAd.image ||
    rawAd.img ||
    rawAd.mediaUrl ||
    rawAd.media ||
    rawAd.bannerUrl ||
    '';

  const redirectUrl =
    rawAd.redirectUrl ||
    rawAd.link ||
    rawAd.url ||
    rawAd.redirect ||
    '';

  return {
    ...rawAd,
    image,
    redirectUrl,
    title: rawAd.title || rawAd.name || 'Featured Advertisement',
    description: rawAd.description || rawAd.details || rawAd.content || '',
    ctaText: rawAd.ctaText || rawAd.buttonText || 'Learn More',
    advertiser: rawAd.advertiser || rawAd.company || rawAd.brand || '',
  };
}

function assignLeader(side) {
  if (store.leaders[side] && store.mounted[side].has(store.leaders[side])) {
    return;
  }

  const firstMounted = store.mounted[side].values().next().value ?? null;
  store.leaders[side] = firstMounted;
}

function register(side, instanceId) {
  store.mounted[side].add(instanceId);
  assignLeader(side);
  emit();
}

function unregister(side, instanceId) {
  store.mounted[side].delete(instanceId);
  if (store.leaders[side] === instanceId) {
    store.leaders[side] = null;
    assignLeader(side);
  }
  emit();
}

function ensureRotationTimer() {
  if (store.rotationTimer || store.ads.length <= 1) return;

  store.rotationTimer = window.setInterval(() => {
    store.rotationStep += 1;
    emit();
  }, ROTATION_MS);
}

function ensureShowTimer() {
  if (store.hasShown || store.showTimer) return;

  store.showTimer = window.setTimeout(() => {
    store.hasShown = true;
    store.showTimer = null;
    emit();
  }, SHOW_DELAY_MS);
}

async function ensureAdsLoaded() {
  if (store.isLoading || store.ads.length > 0) {
    ensureShowTimer();
    ensureRotationTimer();
    return;
  }

  store.isLoading = true;
  emit();

  try {
    const response = await adsAPI.getActiveAds();
    const normalized = Array.isArray(response) ? response.map(normalizeAd).filter(Boolean) : [];
    store.ads = normalized;
  } catch (error) {
    console.error('Error loading ads:', error);
    store.ads = [];
  } finally {
    store.isLoading = false;
    ensureShowTimer();
    ensureRotationTimer();
    emit();
  }
}

function closeSlot(side) {
  store.closed[side] = true;
  emit();
}

function subscribe(listener) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot(side, instanceId) {
  const isLeader = store.leaders[side] === instanceId;
  const adCount = store.ads.length;

  if (!isLeader || !store.hasShown || adCount === 0) {
    return {
      isLeader,
      ad: null,
      show: false,
      adCount,
      currentIndex: -1,
    };
  }

  if (store.closed[side]) {
    return {
      isLeader,
      ad: null,
      show: false,
      adCount,
      currentIndex: -1,
    };
  }

  // Keep two distinct popups when there are 2+ ads. With a single ad, only show it on the right.
  if (adCount === 1 && side === 'left') {
    return {
      isLeader,
      ad: null,
      show: false,
      adCount,
      currentIndex: -1,
    };
  }

  const offset = side === 'left' ? 0 : 1;
  const currentIndex = adCount === 1 ? 0 : (store.rotationStep + offset) % adCount;

  return {
    isLeader,
    ad: store.ads[currentIndex] || null,
    show: Boolean(store.ads[currentIndex]),
    adCount,
    currentIndex,
  };
}

export function useAdPopupSlot(side) {
  const instanceIdRef = useRef(null);
  const [, forceRender] = useState(0);

  if (!instanceIdRef.current) {
    instanceIdRef.current = nextInstanceId++;
  }

  useEffect(() => {
    const rerender = () => forceRender((v) => v + 1);
    const unsubscribe = subscribe(rerender);

    register(side, instanceIdRef.current);
    ensureAdsLoaded();

    return () => {
      unsubscribe();
      unregister(side, instanceIdRef.current);
    };
  }, [side]);

  const snapshot = getSnapshot(side, instanceIdRef.current);

  return {
    ...snapshot,
    close: () => closeSlot(side),
  };
}

export function AdPopupSlot({ side = 'right' }) {
  const { ad, show, adCount, currentIndex, close } = useAdPopupSlot(side);

  if (!show || !ad) return null;

  const positionClass = side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6';
  const slideClass = side === 'left' ? 'translate-y-0' : 'translate-y-0';

  const handleOpen = () => {
    if (!ad.redirectUrl) return;
    window.open(ad.redirectUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`fixed bottom-3 sm:bottom-6 ${positionClass} z-[9999] w-[calc(100vw-1.5rem)] sm:w-full max-w-[340px]`}>
      <div
        className={`group relative overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-18px_rgba(15,23,42,0.55)] ${slideClass}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-orange-50/50" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray-600 shadow-sm transition hover:bg-white hover:text-red-600"
          aria-label="Close ad popup"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <button type="button" onClick={handleOpen} className="block w-full text-left">
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.title || 'Advertisement'}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <span className="text-sm font-medium text-gray-500">Advertisement</span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent px-4 pb-3 pt-8">
              <div className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700 shadow-sm">
                Sponsored
              </div>
            </div>
          </div>

          <div className="relative p-4">
            <div className="mb-2 pr-9">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                {ad.title || 'Featured Advertisement'}
              </h3>
            </div>

            {ad.description ? (
              <p className="mb-3 line-clamp-2 text-xs leading-5 text-gray-600">{ad.description}</p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {ad.advertiser ? (
                  <p className="truncate text-[11px] font-medium text-gray-500">By {ad.advertiser}</p>
                ) : (
                  <p className="text-[11px] text-gray-400">Promoted content</p>
                )}
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition group-hover:from-red-700 group-hover:to-orange-600">
                {ad.ctaText || 'Open'}
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>

            {adCount > 1 ? (
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: Math.min(adCount, 6) }).map((_, i) => {
                  const normalizedIndex = currentIndex % Math.min(adCount, 6);
                  const active = i === normalizedIndex;
                  return (
                    <span
                      key={`dot-${side}-${i}`}
                      className={`h-1.5 rounded-full transition-all ${active ? 'w-5 bg-red-500' : 'w-1.5 bg-gray-300'}`}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        </button>
      </div>

    </div>
  );
}
