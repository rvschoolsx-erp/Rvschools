-- ============================================================
-- SchoolConnect — school_settings table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS school_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_code       VARCHAR(50) UNIQUE NOT NULL DEFAULT 'default',
  school_name       VARCHAR(200) NOT NULL DEFAULT 'My School',
  school_name_hindi VARCHAR(200),
  logo_url          TEXT,
  favicon_url       TEXT,
  primary_color     VARCHAR(7) DEFAULT '#1d4ed8',
  secondary_color   VARCHAR(7) DEFAULT '#f59e0b',
  tagline           VARCHAR(300),
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  pin_code          VARCHAR(10),
  phone             VARCHAR(20),
  email             VARCHAR(255),
  website           VARCHAR(255),
  established_year  INTEGER,
  affiliation       VARCHAR(200),
  plan              VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'standard', 'premium', 'enterprise')),
  plan_expiry       DATE,
  students_limit    INTEGER DEFAULT 500,
  is_active         BOOLEAN DEFAULT TRUE,
  white_label       BOOLEAN DEFAULT FALSE,
  custom_domain     VARCHAR(255),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update trigger
CREATE TRIGGER update_school_settings_updated_at
  BEFORE UPDATE ON school_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings (one row for the school)
INSERT INTO school_settings (
  school_code, school_name, school_name_hindi,
  primary_color, secondary_color,
  tagline, plan, plan_expiry, students_limit
) VALUES (
  'default', 'My School', 'मेरा विद्यालय',
  '#1d4ed8', '#f59e0b',
  'Powered by SchoolConnect',
  'standard', '2026-12-31', 1500
) ON CONFLICT (school_code) DO NOTHING;
