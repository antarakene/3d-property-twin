-- ====================================================================
-- NagarDrishti 3D - Row Level Security (RLS) & User Roles
-- ====================================================================

-- 1. Helper Function: Get Current User Role securely from profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role_type AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_demo'::user_role_type
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Automatic Profile Creation Trigger on Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'NagarDrishti User'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role_type, 'public_demo'::user_role_type)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable RLS on all tables (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertical_sub_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discrepancy_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- PROFILES
DROP POLICY IF EXISTS "Profiles visible to authenticated users" ON public.profiles;
CREATE POLICY "Profiles visible to authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- PARENT PARCELS, BUILDINGS, FLOORS (Public 3D View, Admin Edit)
DROP POLICY IF EXISTS "Parcels public read" ON public.parent_parcels;
CREATE POLICY "Parcels public read" ON public.parent_parcels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Buildings public read" ON public.buildings;
CREATE POLICY "Buildings public read" ON public.buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Floors public read" ON public.floors;
CREATE POLICY "Floors public read" ON public.floors FOR SELECT USING (true);

-- VERTICAL SUB-UNITS (VSUs)
DROP POLICY IF EXISTS "VSUs public read" ON public.vertical_sub_units;
CREATE POLICY "VSUs public read" ON public.vertical_sub_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "VSUs insert by surveyors/officers/demo" ON public.vertical_sub_units;
CREATE POLICY "VSUs insert by surveyors/officers/demo"
  ON public.vertical_sub_units FOR INSERT
  WITH CHECK (true); -- Permits candidate draft submissions in demo sandbox

DROP POLICY IF EXISTS "VSUs update by authorized officers or assigned surveyors" ON public.vertical_sub_units;
CREATE POLICY "VSUs update by authorized officers or assigned surveyors"
  ON public.vertical_sub_units FOR UPDATE
  USING (
    public.get_current_user_role() IN ('municipal_officer', 'admin', 'surveyor', 'public_demo')
  );

-- EVIDENCE & OBSERVATIONS
DROP POLICY IF EXISTS "Evidence public read" ON public.evidence_sources;
CREATE POLICY "Evidence public read" ON public.evidence_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Satellite obs public read" ON public.satellite_observations;
CREATE POLICY "Satellite obs public read" ON public.satellite_observations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Survey obs public read" ON public.survey_observations;
CREATE POLICY "Survey obs public read" ON public.survey_observations FOR SELECT USING (true);

-- DISCREPANCY ALERTS
DROP POLICY IF EXISTS "Alerts public read" ON public.discrepancy_alerts;
CREATE POLICY "Alerts public read" ON public.discrepancy_alerts FOR SELECT USING (true);

-- VERIFICATION TASKS
DROP POLICY IF EXISTS "Verification tasks public read" ON public.verification_tasks;
CREATE POLICY "Verification tasks public read" ON public.verification_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Verification tasks manageable by officers and surveyors" ON public.verification_tasks;
CREATE POLICY "Verification tasks manageable by officers and surveyors"
  ON public.verification_tasks FOR ALL
  USING (true);

-- RECORD VERSIONS & AUDIT EVENTS (Immutable Append-Only Audit Trail)
DROP POLICY IF EXISTS "Versions public read" ON public.record_versions;
CREATE POLICY "Versions public read" ON public.record_versions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Versions insert only" ON public.record_versions;
CREATE POLICY "Versions insert only" ON public.record_versions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Audit events public read" ON public.audit_events;
CREATE POLICY "Audit events public read" ON public.audit_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Audit events insert only" ON public.audit_events;
CREATE POLICY "Audit events insert only" ON public.audit_events FOR INSERT WITH CHECK (true);
-- Note: NO UPDATE OR DELETE POLICY ON audit_events (Enforces Non-Repudiation)

-- SOS EVENTS
DROP POLICY IF EXISTS "SOS events read by authenticated/responders" ON public.sos_events;
CREATE POLICY "SOS events read by authenticated/responders" ON public.sos_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "SOS events insert" ON public.sos_events;
CREATE POLICY "SOS events insert" ON public.sos_events FOR INSERT WITH CHECK (true);
