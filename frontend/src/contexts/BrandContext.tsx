'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface BrandSettings {
  schoolName: string;
  schoolNameHindi: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  affiliation: string;
  establishedYear: number | null;
  plan: 'basic' | 'standard' | 'premium';
  planExpiry: string | null;
  whiteLabelEnabled: boolean;
}

const defaultBrand: BrandSettings = {
  schoolName: 'My School',
  schoolNameHindi: 'मेरा विद्यालय',
  logoUrl: null,
  primaryColor: '#1d4ed8',
  secondaryColor: '#f59e0b',
  tagline: 'Powered by SchoolConnect',
  address: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  website: '',
  affiliation: '',
  establishedYear: null,
  plan: 'basic',
  planExpiry: null,
  whiteLabelEnabled: false,
};

const BrandContext = createContext<BrandSettings>(defaultBrand);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    fetch(`${apiUrl}/school-settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          const d = data.data;
          setBrand({
            schoolName: d.school_name || defaultBrand.schoolName,
            schoolNameHindi: d.school_name_hindi || defaultBrand.schoolNameHindi,
            logoUrl: d.logo_url || null,
            primaryColor: d.primary_color || defaultBrand.primaryColor,
            secondaryColor: d.secondary_color || defaultBrand.secondaryColor,
            tagline: d.tagline || defaultBrand.tagline,
            address: d.address || '',
            city: d.city || '',
            state: d.state || '',
            phone: d.phone || '',
            email: d.email || '',
            website: d.website || '',
            affiliation: d.affiliation || '',
            establishedYear: d.established_year || null,
            plan: d.plan || 'basic',
            planExpiry: d.plan_expiry || null,
            whiteLabelEnabled: d.white_label || false,
          });
        }
      })
      .catch(() => {});
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);
