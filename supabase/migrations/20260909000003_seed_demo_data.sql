-- ====================================================================
-- NagarDrishti 3D - Seed Demo Data Migration
-- ====================================================================

-- Clear existing demo seed data cleanly
TRUNCATE TABLE public.sos_events, public.audit_events, public.record_versions,
               public.verification_tasks, public.discrepancy_alerts,
               public.survey_observations, public.satellite_observations,
               public.evidence_sources, public.vertical_sub_units,
               public.floors, public.buildings, public.parent_parcels CASCADE;

-- 1. PARENT PARCELS
INSERT INTO public.parent_parcels (id, demo_ulpin_reference, parcel_name, survey_number, state, district, taluka, zone_name, area_sqm, spatial_datum)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'DEMO-MH-MUM-0001', 'Plot CTS-9812/2A (Twin Towers)', 'CTS-9812/2A', 'Maharashtra (27)', 'Mumbai Suburban (518)', 'Andheri (03)', 'Maharashtra Urban Demo Zone 4', 2436.0, 'EPSG:7760 • WGS84 UTM 43N'),
  ('22222222-2222-2222-2222-222222222222', 'DEMO-MH-MUM-0002', 'Plot CTS-9812/2B (Commerce Plaza Complex)', 'CTS-9812/2B', 'Maharashtra (27)', 'Mumbai Suburban (518)', 'Andheri (03)', 'Maharashtra Urban Demo Zone 4', 1850.0, 'EPSG:7760 • WGS84 UTM 43N'),
  ('33333333-3333-3333-3333-333333333333', 'DEMO-MH-MUM-0003', 'Plot CTS-9812/2C (Heritage & Green Enclave)', 'CTS-9812/2C', 'Maharashtra (27)', 'Mumbai Suburban (518)', 'Andheri (03)', 'Maharashtra Urban Demo Zone 4', 3100.0, 'EPSG:7760 • WGS84 UTM 43N');

-- 2. BUILDINGS
INSERT INTO public.buildings (id, parcel_id, building_name, building_code, total_floors, height_m, confidence_tier, status, base_coordinates)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Tower A', 'TOWER-A', 10, 34.2, 'Tier A', 'Verified', '{"longitude": 73.9856, "latitude": 18.2345, "altitude": 0.0}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Tower B', 'TOWER-B', 9, 34.7, 'Tier C', 'Under Review', '{"longitude": 73.9862, "latitude": 18.2348, "altitude": 0.0}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Commerce Plaza', 'COMM-PLAZA', 4, 16.0, 'Tier C', 'Draft', '{"longitude": 73.9840, "latitude": 18.2330, "altitude": 0.0}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Heritage Court', 'HERITAGE-CT', 2, 8.5, 'Tier D', 'Estimated', '{"longitude": 73.9880, "latitude": 18.2360, "altitude": 0.0}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Green Residency', 'GREEN-RES', 6, 20.4, 'Tier C', 'Conflict', '{"longitude": 73.9870, "latitude": 18.2352, "altitude": 0.0}');

-- 3. FLOORS FOR TOWER A (10 Floors)
DO $$
DECLARE
  f INT;
  f_id UUID;
  z_bot NUMERIC;
  z_top NUMERIC;
BEGIN
  FOR f IN 1..10 LOOP
    z_bot := 1.2 + (f - 1) * 3.4;
    z_top := z_bot + 3.4;
    f_id := gen_random_uuid();

    INSERT INTO public.floors (id, building_id, floor_number, floor_label, z_bottom_m, z_top_m, floor_height_m)
    VALUES (
      f_id,
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      f,
      CASE WHEN f = 1 THEN '1st Floor (Plinth)'
           WHEN f = 2 THEN '2nd Floor Level'
           WHEN f = 3 THEN '3rd Floor Level'
           ELSE f || 'th Floor Level' END,
      z_bot,
      z_top,
      3.4
    );

    -- 4 units per floor (40 total VSUs for Tower A)
    INSERT INTO public.vertical_sub_units (
      building_id, floor_id, prototype_vsu_identifier, unit_number, unit_name, use_type,
      carpet_area_sqm, builtup_area_sqm, volume_cum, z_bottom_m, z_top_m,
      confidence_tier, verification_status, mock_document_reference, mock_occupant_name, quadrant_code
    )
    VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', f_id, 'DEMO-MH-MUM-0001-VSU-A-' || LPAD(f::text, 2, '0') || '-101', f || '01', 'Penthouse Suite ' || f || '01', 'Residential 3BHK', 118.5, 142.2, 483.5, z_bot, z_top, 'Tier A', 'Verified', 'MOCK-REG-2024-8891A', 'Vikramaditya Rao', '1'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', f_id, 'DEMO-MH-MUM-0001-VSU-A-' || LPAD(f::text, 2, '0') || '-102', f || '02', 'Corner Apt ' || f || '02', 'Residential 2BHK', 88.0, 106.0, 360.4, z_bot, z_top, 'Tier A', CASE WHEN f = 7 THEN 'Under Review' ELSE 'Verified' END, 'MOCK-REG-2023-4122B', 'Meera S. Kulkarni', '2'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', f_id, 'DEMO-MH-MUM-0001-VSU-A-' || LPAD(f::text, 2, '0') || '-103', f || '03', 'Studio Suite ' || f || '03', 'Commercial Studio', 65.4, 81.2, 276.1, z_bot, z_top, 'Tier A', 'Verified', 'MOCK-REG-2024-9043C', 'Apex Digital Labs', '3'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', f_id, 'DEMO-MH-MUM-0001-VSU-A-' || LPAD(f::text, 2, '0') || '-104', f || '04', 'Terrace Flat ' || f || '04', 'Residential 2BHK', 94.2, 114.8, 390.3, z_bot, z_top, 'Tier A', 'Verified', 'MOCK-REG-2022-7719D', 'Farhan A. Qureshi', '4');
  END LOOP;
END $$;

-- 4. FLOORS FOR TOWER B (9 Floors)
DO $$
DECLARE
  f INT;
  f_id UUID;
  z_bot NUMERIC;
  z_top NUMERIC;
BEGIN
  FOR f IN 1..9 LOOP
    z_bot := 1.2 + (f - 1) * 3.4;
    z_top := z_bot + 3.4;
    f_id := gen_random_uuid();

    INSERT INTO public.floors (id, building_id, floor_number, floor_label, z_bottom_m, z_top_m, floor_height_m)
    VALUES (f_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', f, 'Floor ' || f, z_bot, z_top, 3.4);

    -- 2 candidate units per floor
    INSERT INTO public.vertical_sub_units (
      building_id, floor_id, prototype_vsu_identifier, unit_number, unit_name, use_type,
      carpet_area_sqm, builtup_area_sqm, volume_cum, z_bottom_m, z_top_m,
      confidence_tier, verification_status, mock_document_reference, mock_occupant_name, quadrant_code
    )
    VALUES
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', f_id, 'DEMO-MH-MUM-0002-VSU-B-' || LPAD(f::text, 2, '0') || '-201', f || '01', 'Tower B Apt ' || f || '01', 'Residential', 92.0, 112.0, 380.8, z_bot, z_top, 'Tier C', CASE WHEN f = 9 THEN 'Under Review' ELSE 'Draft' END, 'MOCK-REG-2023-9001B', 'Citizen Candidate', '1'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', f_id, 'DEMO-MH-MUM-0002-VSU-B-' || LPAD(f::text, 2, '0') || '-202', f || '02', 'Tower B Apt ' || f || '02', 'Residential', 95.0, 115.0, 391.0, z_bot, z_top, 'Tier C', CASE WHEN f = 9 THEN 'Under Review' ELSE 'Draft' END, 'MOCK-REG-2023-9002B', 'Citizen Candidate', '2');
  END LOOP;
END $$;

-- 5. FLOORS FOR COMMERCE PLAZA (4 Floors)
DO $$
DECLARE
  f INT;
  f_id UUID;
BEGIN
  FOR f IN 1..4 LOOP
    f_id := gen_random_uuid();
    INSERT INTO public.floors (id, building_id, floor_number, floor_label, z_bottom_m, z_top_m, floor_height_m)
    VALUES (f_id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', f, CASE WHEN f = 1 THEN 'Ground Shopping Plaza' WHEN f = 2 THEN 'Basement Parking & Storage' ELSE 'Floor ' || f || ' Offices' END, (f-1)*4.0, f*4.0, 4.0);

    INSERT INTO public.vertical_sub_units (
      building_id, floor_id, prototype_vsu_identifier, unit_number, unit_name, use_type,
      carpet_area_sqm, builtup_area_sqm, volume_cum, z_bottom_m, z_top_m,
      confidence_tier, verification_status, mock_document_reference, mock_occupant_name
    )
    VALUES
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', f_id, 'DEMO-MH-MUM-0003-COMM-' || f || '-01', f || '01', 'Commercial Suite ' || f || '01', CASE WHEN f = 1 THEN 'Retail' WHEN f = 2 THEN 'Parking' ELSE 'Commercial Office' END, 140.0, 175.0, 700.0, (f-1)*4.0, f*4.0, 'Tier C', 'Draft', 'MOCK-COMM-2024-001', 'Commercial Tenant');
  END LOOP;
END $$;

-- 6. EVIDENCE SOURCES
INSERT INTO public.evidence_sources (building_id, source_type, title, description, sensor_gsd, concurrence_score, capture_date)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Drone DSM', '2024 Drone DSM Orthophoto', 'UAV-Surv-2024-Nov-22 stereo pair photogrammetry', '2.4cm GSD', 99.1, '2024-11-22'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Architectural Plan', 'Sanctioned Arch. Floor Plan Rev 4', 'Municipal approved vector CAD blueprint A-07', 'Vector CAD', 96.4, '2024-08-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mobile LiDAR', 'Terrestrial Mobile LiDAR Parapet Scan', 'Exterior facade and cantilever overhang millimeter scan', '0.012m RMSE', 94.8, '2024-10-02'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Satellite DSM', 'Multi-Spectral Satellite Stereo Pair (T2)', 'High-resolution nadir pass flagging rooftop elevation shift', '0.3m GSD', 81.0, '2026-07-28'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Survey Vehicle', 'Vehicle Cam MMS-4 Ground Truth', 'Mobile Mapping System optical upward scan confirming RCC columns', 'Optical 4K', 92.5, '2026-08-04');

-- 7. SATELLITE OBSERVATIONS (T1 vs T2)
INSERT INTO public.satellite_observations (building_id, observation_stage, capture_date, height_m, footprint_sqm, diff_detected, metadata)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'T1 Baseline', '2025-02-14', 30.4, 1104.0, false, '{"notes": "Terrace clean and compliant", "rooftop_structures": "Nil"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'T2 Comparative', '2026-07-28', 34.7, 1146.6, true, '{"height_diff_m": 4.3, "footprint_diff_sqm": 42.6, "notes": "Potential rooftop structure detected"}');

-- 8. SURVEY OBSERVATIONS
INSERT INTO public.survey_observations (building_id, vehicle_id, capture_date, sensor_type, observation_notes)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MMS-VEHICLE-04', '2026-08-04', 'Optical Camera + Mobile LiDAR Pod', 'Confirmed: Fresh RCC Pillars & lightweight blue galvanized tin roofing on rooftop level.');

-- 9. DISCREPANCY ALERTS
INSERT INTO public.discrepancy_alerts (id, building_id, alert_code, alert_type, severity, height_delta_m, footprint_delta_sqm, description, status)
VALUES
  ('99999999-9999-9999-9999-999999999991', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ALT-2026-0042', 'Potential Rooftop Extension', 'High', 4.3, 42.6, 'Satellite T1 vs T2 differential detects +4.3m vertical elevation shift on terrace level exceeding sanctioned baseline.', 'Active'),
  ('99999999-9999-9999-9999-999999999992', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ALT-2026-0089', 'Potential Setback Balcony Overhang', 'Medium', 0.0, 14.8, 'Cantilever living balcony overhang (+1.65m) encroaches toward civic setback perimeter on Floor 6.', 'Active'),
  ('99999999-9999-9999-9999-999999999993', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ALT-2026-0105', 'Potential Boundary Conflict', 'Low', 0.0, 22.0, 'Adjacent parcel boundary alignment discrepancy between drone orthophoto and registered deed.', 'Active');

-- 10. VERIFICATION TASKS
DO $$
DECLARE
  vsu_sample_id UUID;
BEGIN
  SELECT id INTO vsu_sample_id FROM public.vertical_sub_units WHERE prototype_vsu_identifier = 'DEMO-MH-MUM-0001-VSU-A-07-102' LIMIT 1;
  IF vsu_sample_id IS NOT NULL THEN
    INSERT INTO public.verification_tasks (vsu_id, verification_status, officer_notes, checklist_results, assigned_officer)
    VALUES (
      vsu_sample_id,
      'Under Review',
      'Unit 702 deed area matches 3D point cloud within 1.2% tolerance. Cross-checking mobile lidar parapet clearance.',
      '{"manifold_2d": true, "boundary_within_building": true, "vertical_clearance_valid": true, "no_vsu_overlap": true, "deed_tolerance_passed": true}',
      'Officer A. Patil (Zone 4)'
    );

    INSERT INTO public.record_versions (vsu_id, version_number, version_status, snapshot_data, audit_record_reference)
    VALUES
      (vsu_sample_id, 'v1.0', 'Draft', '{"area": 88.0, "stage": "Initial CAD extraction"}', 'AUDIT-REF-2024-GENESIS-01'),
      (vsu_sample_id, 'v2.0', 'Validated', '{"area": 88.0, "stage": "3D mesh 2-manifold validated"}', 'AUDIT-REF-2024-VALID-02'),
      (vsu_sample_id, 'v2.1', 'Under Review', '{"area": 88.0, "stage": "Assigned to Officer A. Patil"}', 'AUDIT-REF-2026-REVIEW-03');

    INSERT INTO public.audit_events (vsu_id, event_title, event_type, performed_by, user_role, description)
    VALUES
      (vsu_sample_id, 'Candidate Record Instantiated', 'GENESIS', 'System Pipeline', 'admin', 'Derived from legacy 2D CAD Cadastral Plan CTS-9812.'),
      (vsu_sample_id, 'Drone & LiDAR Point Cloud Ingested', 'SENSOR_INGESTION', 'Surveyor R. Shinde', 'surveyor', 'Uploaded UAV flight survey package with 1.8cm GSD.'),
      (vsu_sample_id, 'Automated Spatial Validation Passed', 'VALIDATION', 'Spatial Geometry Engine', 'system', 'Mesh 2-Manifold topology verified; vertical Z-Span conforms to demo zone parameters.'),
      (vsu_sample_id, 'Officer Review Session Opened', 'REVIEW_OPENED', 'Officer A. Patil', 'municipal_officer', 'Initiated by Officer A. Patil via Municipal Verification Station CAD-04.');
  END IF;
END $$;
