-- ====================================================================
-- NagarDrishti 3D - Initial Database Schema Migration
-- Designed for Smart India Hackathon: Prototype 3D Cadastral Intelligence
-- ====================================================================

-- 1. Custom Types & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('public_demo', 'surveyor', 'municipal_officer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role_type DEFAULT 'public_demo',
  station_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Parent Parcels (Ground Cadastral Plots)
CREATE TABLE IF NOT EXISTS public.parent_parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_ulpin_reference TEXT UNIQUE NOT NULL,
  parcel_name TEXT NOT NULL,
  survey_number TEXT NOT NULL,
  state TEXT DEFAULT 'Maharashtra (27)',
  district TEXT DEFAULT 'Pune (516)',
  taluka TEXT DEFAULT 'Haveli (04)',
  zone_name TEXT DEFAULT 'Zone 4 (East)',
  area_sqm NUMERIC NOT NULL,
  spatial_datum TEXT DEFAULT 'EPSG:7760 • WGS84 UTM 43N',
  geometry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buildings (Structures upon Parcels)
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES public.parent_parcels(id) ON DELETE CASCADE,
  building_name TEXT NOT NULL,
  building_code TEXT NOT NULL,
  total_floors INT NOT NULL,
  height_m NUMERIC NOT NULL,
  confidence_tier TEXT DEFAULT 'Tier A',
  status TEXT DEFAULT 'Verified',
  base_coordinates JSONB NOT NULL,
  geometry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Floors (Vertical Elevation Slices)
CREATE TABLE IF NOT EXISTS public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_number INT NOT NULL,
  floor_label TEXT NOT NULL,
  z_bottom_m NUMERIC NOT NULL,
  z_top_m NUMERIC NOT NULL,
  floor_height_m NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, floor_number)
);

-- 6. Vertical Sub-Units (Candidate VSUs)
CREATE TABLE IF NOT EXISTS public.vertical_sub_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  prototype_vsu_identifier TEXT UNIQUE NOT NULL,
  unit_number TEXT NOT NULL,
  unit_name TEXT,
  use_type TEXT DEFAULT 'Residential',
  carpet_area_sqm NUMERIC NOT NULL,
  builtup_area_sqm NUMERIC NOT NULL,
  volume_cum NUMERIC NOT NULL,
  z_bottom_m NUMERIC NOT NULL,
  z_top_m NUMERIC NOT NULL,
  confidence_tier TEXT DEFAULT 'Tier A',
  verification_status TEXT DEFAULT 'Draft',
  mock_document_reference TEXT,
  mock_occupant_name TEXT,
  quadrant_code TEXT,
  geometry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Evidence Sources (Sensor & Documentation Artifacts)
CREATE TABLE IF NOT EXISTS public.evidence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  vsu_id UUID REFERENCES public.vertical_sub_units(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  sensor_gsd TEXT,
  concurrence_score NUMERIC,
  capture_date DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Satellite Observations (T1 vs T2 Temporal Baseline)
CREATE TABLE IF NOT EXISTS public.satellite_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  observation_stage TEXT NOT NULL,
  capture_date DATE NOT NULL,
  height_m NUMERIC NOT NULL,
  footprint_sqm NUMERIC NOT NULL,
  diff_detected BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Survey Observations (Ground Vehicle / Drone MMS)
CREATE TABLE IF NOT EXISTS public.survey_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  capture_date DATE NOT NULL,
  sensor_type TEXT NOT NULL,
  observation_notes TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Discrepancy Alerts (Spatial Divergence Flags)
CREATE TABLE IF NOT EXISTS public.discrepancy_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  vsu_id UUID REFERENCES public.vertical_sub_units(id) ON DELETE SET NULL,
  alert_code TEXT UNIQUE NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  height_delta_m NUMERIC,
  footprint_delta_sqm NUMERIC,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Verification Tasks (Surveyor Workflow Queue)
CREATE TABLE IF NOT EXISTS public.verification_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsu_id UUID NOT NULL REFERENCES public.vertical_sub_units(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'Under Review',
  officer_notes TEXT,
  checklist_results JSONB,
  assigned_officer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Record Versions (Immutable Snapshot Versioning)
CREATE TABLE IF NOT EXISTS public.record_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsu_id UUID NOT NULL REFERENCES public.vertical_sub_units(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  version_status TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  audit_record_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Events (Chronological Administrative Log)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vsu_id UUID REFERENCES public.vertical_sub_units(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  user_role TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SOS Events (Low-Priority Demo Geospatial Resolver)
CREATE TABLE IF NOT EXISTS public.sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID REFERENCES public.parent_parcels(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  vsu_id UUID REFERENCES public.vertical_sub_units(id) ON DELETE SET NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy_m NUMERIC,
  waypoint_route JSONB,
  status TEXT DEFAULT 'Logged',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Fast Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_buildings_parcel ON public.buildings(parcel_id);
CREATE INDEX IF NOT EXISTS idx_floors_building ON public.floors(building_id);
CREATE INDEX IF NOT EXISTS idx_vsus_floor ON public.vertical_sub_units(floor_id);
CREATE INDEX IF NOT EXISTS idx_vsus_building ON public.vertical_sub_units(building_id);
CREATE INDEX IF NOT EXISTS idx_alerts_building ON public.discrepancy_alerts(building_id);
CREATE INDEX IF NOT EXISTS idx_tasks_vsu ON public.verification_tasks(vsu_id);
CREATE INDEX IF NOT EXISTS idx_audit_vsu ON public.audit_events(vsu_id);
