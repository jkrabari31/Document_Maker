import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPricingConfig, savePricingConfig, DEFAULT_PRICING } from '../utils/pricingConfig';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [pricingLoading, setPricingLoading] = useState(true);

  // Load pricing on mount
  const loadPricing = useCallback(async () => {
    setPricingLoading(true);
    try {
      const config = await fetchPricingConfig();
      setPricing(config);
    } catch (err) {
      console.error('[PricingContext] Failed to load pricing:', err);
      setPricing(DEFAULT_PRICING);
    } finally {
      setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  // Save pricing (admin-only action) and refresh context
  const updatePricing = useCallback(async (newConfig) => {
    await savePricingConfig(newConfig);
    setPricing(newConfig);
  }, []);

  return (
    <PricingContext.Provider value={{ pricing, pricingLoading, loadPricing, updatePricing }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used inside <PricingProvider>');
  return ctx;
}

