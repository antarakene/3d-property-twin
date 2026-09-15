import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  ParentParcel,
  Building,
  Floor,
  CandidateVsu,
  EvidenceSource,
  SatelliteObservation,
  DiscrepancyAlert,
  VerificationTask,
  AuditEvent,
  UserRole,
} from '../types/cadastre';
import {
  SEED_PARCELS,
  SEED_BUILDINGS,
  SEED_FLOORS,
  SEED_VSUS,
  SEED_EVIDENCE,
  SEED_SATELLITE_OBS,
  SEED_ALERTS,
  SEED_TASKS,
  SEED_AUDIT_EVENTS,
} from '../data/seedData';

// Persistent in-memory cache of statutory 3D-ULPINs
export const VSU_ULPIN_REGISTRY = new Map<string, string>();

// Pre-populate registry from seed data
SEED_VSUS.forEach((v) => {
  if (v.canonical3dUlpin) {
    if (v.id) VSU_ULPIN_REGISTRY.set(v.id, v.canonical3dUlpin);
    if (v.prototypeVsuIdentifier) VSU_ULPIN_REGISTRY.set(v.prototypeVsuIdentifier, v.canonical3dUlpin);
  }
});

export function getBuildingShortCode(building?: { id?: string; buildingCode?: string }): string {
  if (!building) return 'A';
  const id = building.id || '';
  const code = (building.buildingCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' || code.includes('TOWERA') || code === 'A') return 'A';
  if (id === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' || code.includes('TOWERB') || code === 'B') return 'B';
  if (id === 'cccccccc-cccc-cccc-cccc-cccccccccccc' || code.includes('COMM')) return 'COMM';
  if (id === 'dddddddd-dddd-dddd-dddd-dddddddddddd' || code.includes('HER')) return 'HER';
  if (id === 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' || code.includes('GREEN') || code.includes('GRN')) return 'GRN';
  return code || 'A';
}

export function synthesizeCanonical3dUlpin(
  _prototypeVsuIdentifier: string,
  unitNumber: string,
  floorNumber: number,
  zBottom: number,
  zTop: number,
  buildingId?: string
): string {
  const bld = SEED_BUILDINGS.find((b) => b.id === buildingId) || SEED_BUILDINGS[0];
  const parcel = SEED_PARCELS.find((p) => p.id === bld?.parcelId) || SEED_PARCELS[0];
  const cleanSurvey = parcel?.surveyNumber ? parcel.surveyNumber.replace(/[^A-Z0-9]/g, '') : 'CTS98122A';
  const bldCode = getBuildingShortCode(bld);
  const fStr = String(floorNumber).padStart(2, '0');
  return `ULPIN3D-MH-${cleanSurvey}-${bldCode}-F${fStr}-U${unitNumber}-Z${zBottom.toFixed(1)}_${zTop.toFixed(1)}`;
}

class CadastreService {
  private activeRole: UserRole = 'public_demo';

  public setUserRole(role: UserRole) {
    this.activeRole = role;
  }

  public getUserRole(): UserRole {
    return this.activeRole;
  }

  // 1. Fetch All Parent Parcels
  async getParentParcels(): Promise<ParentParcel[]> {
    if (!isSupabaseConfigured) return SEED_PARCELS;
    try {
      const { data, error } = await supabase
        .from('parent_parcels')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) return SEED_PARCELS;
      return data.map((p: any) => ({
        id: p.id,
        demoUlpinReference: p.demo_ulpin_reference,
        parcelName: p.parcel_name,
        surveyNumber: p.survey_number,
        state: p.state,
        district: p.district,
        taluka: p.taluka,
        zoneName: p.zone_name,
        areaSqm: Number(p.area_sqm),
        spatialDatum: p.spatial_datum,
        geometry: p.geometry,
      }));
    } catch {
      return SEED_PARCELS;
    }
  }

  // 2. Fetch Buildings (Optionally filtered by parcel)
  async getBuildings(parcelId?: string): Promise<Building[]> {
    if (!isSupabaseConfigured) {
      return parcelId
        ? SEED_BUILDINGS.filter((b) => b.parcelId === parcelId)
        : SEED_BUILDINGS;
    }
    try {
      let query = supabase.from('buildings').select('*');
      if (parcelId) query = query.eq('parcel_id', parcelId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return parcelId
          ? SEED_BUILDINGS.filter((b) => b.parcelId === parcelId)
          : SEED_BUILDINGS;
      }

      return data.map((b: any) => ({
        id: b.id,
        parcelId: b.parcel_id,
        buildingName: b.building_name,
        buildingCode: b.building_code,
        totalFloors: b.total_floors,
        heightM: Number(b.height_m),
        confidenceTier: b.confidence_tier,
        status: b.status,
        baseCoordinates: b.base_coordinates,
        geometry: b.geometry,
      }));
    } catch {
      return SEED_BUILDINGS;
    }
  }

  // 3. Fetch Floors for Building
  async getFloors(buildingId: string): Promise<Floor[]> {
    if (!isSupabaseConfigured) {
      return SEED_FLOORS.filter((f) => f.buildingId === buildingId);
    }
    try {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('building_id', buildingId)
        .order('floor_number', { ascending: true });

      if (error || !data || data.length === 0) {
        return SEED_FLOORS.filter((f) => f.buildingId === buildingId);
      }

      return data.map((f: any) => ({
        id: f.id,
        buildingId: f.building_id,
        floorNumber: f.floor_number,
        floorLabel: f.floor_label,
        zBottomM: Number(f.z_bottom_m),
        zTopM: Number(f.z_top_m),
        floorHeightM: Number(f.floor_height_m),
      }));
    } catch {
      return SEED_FLOORS.filter((f) => f.buildingId === buildingId);
    }
  }

  // 4. Fetch Candidate VSUs
  async getVsus(buildingId?: string, floorNumber?: number): Promise<CandidateVsu[]> {
    let list: CandidateVsu[] = [];
    if (!isSupabaseConfigured) {
      list = [...SEED_VSUS];
    } else {
      try {
        let query = supabase.from('vertical_sub_units').select('*');
        if (buildingId) query = query.eq('building_id', buildingId);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const cleanData = data.filter(
            (v: any) => !v.prototype_vsu_identifier?.includes('DEMO-TEST-UNIT')
          );
          const dbVsus: CandidateVsu[] = cleanData.map((v: any) => {
            // Robust floor number parsing
            let floorNum = 1;
            const match = v.prototype_vsu_identifier?.match(/-(?:F)?(\d{2})-/i);
            if (match) {
              floorNum = parseInt(match[1], 10);
            } else if (v.unit_number) {
              const digits = String(v.unit_number).replace(/\D/g, '');
              if (digits.length >= 3) {
                floorNum = parseInt(digits.slice(0, -2), 10);
              } else if (digits.length > 0) {
                floorNum = parseInt(digits, 10);
              }
            }

            // Normalize buildingId based on prototype identifier if misassigned
            let normBuildingId = v.building_id;
            const proto = v.prototype_vsu_identifier || '';
            if (proto.includes('-VSU-A-') || proto.includes('-TOWERA-')) {
              normBuildingId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
            } else if (proto.includes('-VSU-B-') || proto.includes('-TOWERB-')) {
              normBuildingId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
            } else if (proto.includes('-VSU-COMM-') || proto.includes('-COMM-')) {
              normBuildingId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
            } else if (proto.includes('-VSU-HER-') || proto.includes('-HER-')) {
              normBuildingId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
            } else if (proto.includes('-VSU-GRN-') || proto.includes('GREEN') || proto.includes('-GRN-')) {
              normBuildingId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
            }

            // Statutory Canonical 3D-ULPIN Resolution
            let canonical3dUlpin =
              v.canonical_3d_ulpin ||
              VSU_ULPIN_REGISTRY.get(v.id) ||
              VSU_ULPIN_REGISTRY.get(v.prototype_vsu_identifier);

            if (!canonical3dUlpin) {
              canonical3dUlpin = synthesizeCanonical3dUlpin(
                v.prototype_vsu_identifier,
                v.unit_number,
                floorNum,
                Number(v.z_bottom_m || 0),
                Number(v.z_top_m || 3.4),
                normBuildingId
              );
              VSU_ULPIN_REGISTRY.set(v.prototype_vsu_identifier, canonical3dUlpin);
              if (v.id) VSU_ULPIN_REGISTRY.set(v.id, canonical3dUlpin);
            }

            return {
              id: v.id,
              buildingId: normBuildingId,
              floorId: v.floor_id,
              floorNumber: floorNum,
              prototypeVsuIdentifier: v.prototype_vsu_identifier,
              canonical3dUlpin,
              unitNumber: v.unit_number,
              unitName: v.unit_name,
              useType: v.use_type,
              carpetAreaSqm: Number(v.carpet_area_sqm),
              builtupAreaSqm: Number(v.builtup_area_sqm),
              volumeCum: Number(v.volume_cum),
              zBottomM: Number(v.z_bottom_m),
              zTopM: Number(v.z_top_m),
              confidenceTier: v.confidence_tier,
              verificationStatus: v.verification_status,
              mockDocumentReference: v.mock_document_reference,
              mockOccupantName: v.mock_occupant_name,
              quadrantCode: v.quadrant_code,
              hasViolation:
                v.unit_number === '602' ||
                v.verification_status === 'Conflict' ||
                v.verification_status === 'Draft',
              geometry: v.geometry,
            };
          });

          // Merge with SEED_VSUS for any local in-memory candidate units or active updates
          const localMap = new Map(SEED_VSUS.map((s) => [s.id, s]));
          const localProtoMap = new Map(SEED_VSUS.map((s) => [s.prototypeVsuIdentifier, s]));

          const mergedDbVsus = dbVsus.map((dbV) => {
            const local = localMap.get(dbV.id) || localProtoMap.get(dbV.prototypeVsuIdentifier);
            if (local) {
              return {
                ...dbV,
                verificationStatus: local.verificationStatus,
                confidenceTier: local.confidenceTier,
                noticePeriodDays: local.noticePeriodDays,
                noticeDeadline: local.noticeDeadline,
                officerRemarks: local.officerRemarks,
                discrepancySummary: local.discrepancySummary,
                hasViolation: local.hasViolation,
              };
            }
            return dbV;
          });

          const dbIds = new Set(mergedDbVsus.map((v) => v.id));
          const dbPrototypes = new Set(mergedDbVsus.map((v) => v.prototypeVsuIdentifier));
          const localExtras = SEED_VSUS.filter(
            (v) => !dbIds.has(v.id) && !dbPrototypes.has(v.prototypeVsuIdentifier)
          );
          list = [...localExtras, ...mergedDbVsus];
        } else {
          list = [...SEED_VSUS];
        }
      } catch {
        list = [...SEED_VSUS];
      }
    }

    // Prioritize units under review or freshly submitted at top of table
    list.sort((a, b) => {
      if (a.verificationStatus === 'Under Review' && b.verificationStatus !== 'Under Review') return -1;
      if (b.verificationStatus === 'Under Review' && a.verificationStatus !== 'Under Review') return 1;
      return 0;
    });

    // Deduplicate only by identical prototypeVsuIdentifier or identical ID so distinct units are never dropped
    const seenIdentifiers = new Set<string>();
    const seenIds = new Set<string>();
    const deduplicatedList: CandidateVsu[] = [];
    for (const v of list) {
      if (v.prototypeVsuIdentifier && seenIdentifiers.has(v.prototypeVsuIdentifier)) continue;
      if (v.id && seenIds.has(v.id)) continue;
      if (v.prototypeVsuIdentifier) seenIdentifiers.add(v.prototypeVsuIdentifier);
      if (v.id) seenIds.add(v.id);
      deduplicatedList.push(v);
    }
    list = deduplicatedList;

    if (buildingId) list = list.filter((v) => v.buildingId === buildingId);
    if (floorNumber) list = list.filter((v) => v.floorNumber === floorNumber);
    return list;
  }

  // 5. Fetch Single VSU by ID or Identifier
  async getVsuById(identifierOrId: string): Promise<CandidateVsu | undefined> {
    const vsus = await this.getVsus();
    return vsus.find(
      (v) => v.id === identifierOrId || v.prototypeVsuIdentifier === identifierOrId
    );
  }

  // 6. Fetch Evidence Sources
  async getEvidenceSources(buildingId?: string): Promise<EvidenceSource[]> {
    if (!isSupabaseConfigured) {
      return buildingId ? SEED_EVIDENCE.filter((e) => e.buildingId === buildingId) : SEED_EVIDENCE;
    }
    try {
      let query = supabase.from('evidence_sources').select('*');
      if (buildingId) query = query.eq('building_id', buildingId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_EVIDENCE;

      return data.map((e: any) => ({
        id: e.id,
        buildingId: e.building_id,
        sourceType: e.source_type,
        title: e.title,
        description: e.description,
        sensorGsd: e.sensor_gsd,
        concurrenceScore: Number(e.concurrence_score),
        captureDate: e.capture_date,
        fileUrl: e.file_url,
      }));
    } catch {
      return SEED_EVIDENCE;
    }
  }

  // 7. Fetch Discrepancy Alerts
  async getDiscrepancyAlerts(buildingId?: string): Promise<DiscrepancyAlert[]> {
    if (!isSupabaseConfigured) {
      return buildingId ? SEED_ALERTS.filter((a) => a.buildingId === buildingId) : SEED_ALERTS;
    }
    try {
      let query = supabase.from('discrepancy_alerts').select('*');
      if (buildingId) query = query.eq('building_id', buildingId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_ALERTS;

      return data.map((a: any) => ({
        id: a.id,
        buildingId: a.building_id,
        buildingName: a.building_name,
        alertCode: a.alert_code,
        alertType: a.alert_type,
        severity: a.severity,
        heightDeltaM: Number(a.height_delta_m),
        footprintDeltaSqm: Number(a.footprint_delta_sqm),
        description: a.description,
        status: a.status,
      }));
    } catch {
      return SEED_ALERTS;
    }
  }

  // 8. Fetch Satellite Observations
  async getSatelliteObservations(buildingId?: string): Promise<SatelliteObservation[]> {
    if (!isSupabaseConfigured) {
      return buildingId
        ? SEED_SATELLITE_OBS.filter((s) => s.buildingId === buildingId)
        : SEED_SATELLITE_OBS;
    }
    try {
      let query = supabase.from('satellite_observations').select('*');
      if (buildingId) query = query.eq('building_id', buildingId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_SATELLITE_OBS;

      return data.map((s: any) => ({
        id: s.id,
        buildingId: s.building_id,
        observationStage: s.observation_stage,
        captureDate: s.capture_date,
        heightM: Number(s.height_m),
        footprintSqm: Number(s.footprint_sqm),
        diffDetected: s.diff_detected,
        imageUrl: s.image_url,
        metadata: s.metadata,
      }));
    } catch {
      return SEED_SATELLITE_OBS;
    }
  }

  // 9. Fetch Verification Queue
  async getVerificationTasks(): Promise<VerificationTask[]> {
    if (!isSupabaseConfigured) return [...SEED_TASKS];
    try {
      const { data, error } = await supabase
        .from('verification_tasks')
        .select('*, vertical_sub_units(prototype_vsu_identifier)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return [...SEED_TASKS];

      const localTaskMap = new Map(SEED_TASKS.map((t) => [t.id, t]));
      const localVsuTaskMap = new Map(SEED_TASKS.map((t) => [t.vsuId, t]));
      const localProtoTaskMap = new Map(SEED_TASKS.map((t) => [t.vsuIdentifier, t]));

      const dbTasks: VerificationTask[] = data
        .filter((t: any) => !t.vertical_sub_units?.prototype_vsu_identifier?.includes('DEMO-TEST-UNIT'))
        .map((t: any) => {
        const protoIdent = t.vertical_sub_units?.prototype_vsu_identifier;
        const local = localTaskMap.get(t.id) || localVsuTaskMap.get(t.vsu_id) || (protoIdent ? localProtoTaskMap.get(protoIdent) : undefined);
        return {
          id: t.id,
          vsuId: t.vsu_id,
          vsuIdentifier: protoIdent || local?.vsuIdentifier || 'Candidate Unit',
          verificationStatus: local?.verificationStatus || t.verification_status,
          officerNotes: local?.officerNotes || t.officer_notes,
          noticePeriodDays: local?.noticePeriodDays,
          noticeDeadline: local?.noticeDeadline,
          rejectionReason: local?.rejectionReason,
          checklistResults: t.checklist_results || local?.checklistResults,
          assignedOfficer: t.assigned_officer || local?.assignedOfficer,
          updatedAt: local?.updatedAt || t.updated_at,
        };
      });

      // Merge with SEED_TASKS, avoiding duplicates by vsuIdentifier or vsuId
      const dbVsuIds = new Set(dbTasks.map((t) => t.vsuId));
      const dbIdentifiers = new Set(dbTasks.map((t) => t.vsuIdentifier));
      const localTasks = SEED_TASKS.filter(
        (t) => !dbVsuIds.has(t.vsuId) && !dbIdentifiers.has(t.vsuIdentifier)
      );

      // If a seed task corresponds to a db task (like Unit 702), map its vsuId to the DB VSU ID
      const allTasks = [...localTasks, ...dbTasks];
      const task702 = allTasks.find((t) => t.vsuIdentifier === 'DEMO-MH-MUM-0001-VSU-A-07-702');
      const dbTask702 = dbTasks.find((t) => t.vsuIdentifier === 'DEMO-MH-MUM-0001-VSU-A-07-702');
      if (task702 && dbTask702 && task702.vsuId !== dbTask702.vsuId) {
        task702.vsuId = dbTask702.vsuId;
      }

      return allTasks;
    } catch {
      return [...SEED_TASKS];
    }
  }

  // 10. Update Verification Task (Approve, Reject, Notes, Notice Period)
  async updateVerificationTask(
    taskId: string,
    vsuId: string,
    status: 'Approved' | 'Rejected' | 'Returned for Correction' | 'Under Review',
    officerNotes: string,
    noticePeriodDays?: number
  ): Promise<boolean> {
    const noticeDays = noticePeriodDays || 15;
    const deadline = new Date(Date.now() + noticeDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const vsuStatus = status === 'Approved' ? 'Verified' : status;

    // Append an immutable audit log
    const eventTitle =
      status === 'Approved'
        ? 'Cadastral Title Approved & Verified'
        : status === 'Returned for Correction'
        ? `Correction Notice Issued (${noticeDays}-Day Notice Period)`
        : status === 'Rejected'
        ? 'Candidate VSU Application Rejected'
        : `Verification Status Updated to ${status}`;

    await this.logAuditEvent({
      vsuId,
      eventTitle,
      eventType: 'VERIFICATION_UPDATE',
      performedBy:
        this.activeRole === 'municipal_officer'
          ? 'Officer A. Patil (Zone 4)'
          : this.activeRole === 'admin'
          ? 'Master Administrator'
          : 'Demo User',
      userRole: this.activeRole,
      description:
        officerNotes +
        (status === 'Returned for Correction' ? ` [Statutory Notice Deadline: ${deadline}]` : '') ||
        `Status updated to ${status}`,
    });

    // Update in-memory SEED_TASKS
    const task = SEED_TASKS.find((t) => t.id === taskId || t.vsuId === vsuId);
    if (task) {
      task.verificationStatus = status;
      task.officerNotes = officerNotes;
      task.noticePeriodDays = noticeDays;
      task.noticeDeadline = deadline;
      if (status === 'Rejected') task.rejectionReason = officerNotes;
      task.updatedAt = 'Just now';
    }

    // Update in-memory SEED_VSUS
    const vsu = SEED_VSUS.find((v) => v.id === vsuId || v.prototypeVsuIdentifier === task?.vsuIdentifier);
    if (vsu) {
      vsu.verificationStatus = vsuStatus;
      vsu.officerRemarks = officerNotes;
      if (status === 'Approved') {
        vsu.confidenceTier = 'Tier A';
        vsu.hasViolation = false;
        vsu.noticePeriodDays = undefined;
        vsu.noticeDeadline = undefined;
      } else if (status === 'Returned for Correction') {
        vsu.noticePeriodDays = noticeDays;
        vsu.noticeDeadline = deadline;
      } else if (status === 'Rejected') {
        vsu.noticePeriodDays = undefined;
        vsu.noticeDeadline = undefined;
      }
    }

    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      const isVsuUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vsuId);
      const isTaskUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskId);

      if (isTaskUuid) {
        await supabase
          .from('verification_tasks')
          .update({
            verification_status: status,
            officer_notes: officerNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);
      } else if (isVsuUuid) {
        await supabase
          .from('verification_tasks')
          .update({
            verification_status: status,
            officer_notes: officerNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('vsu_id', vsuId);
      }

      if (isVsuUuid) {
        await supabase
          .from('vertical_sub_units')
          .update({ verification_status: vsuStatus })
          .eq('id', vsuId);
      } else if (task?.vsuIdentifier) {
        await supabase
          .from('vertical_sub_units')
          .update({ verification_status: vsuStatus })
          .eq('prototype_vsu_identifier', task.vsuIdentifier);
      }

      return true;
    } catch {
      return true;
    }
  }

  // 11. Register Candidate VSU
  async createCandidateVsu(draft: {
    buildingId: string;
    floorNumber: number;
    unitNumber: string;
    unitName: string;
    useType: string;
    carpetAreaSqm: number;
    builtupAreaSqm: number;
    mockDocumentReference: string;
    mockOccupantName: string;
    confidenceTier: string;
    canonical3dUlpin?: string;
    parcelReference?: string;
  }): Promise<CandidateVsu> {
    const f = draft.floorNumber;
    const bld = SEED_BUILDINGS.find((b) => b.id === draft.buildingId) || SEED_BUILDINGS[0];
    const parcel = SEED_PARCELS.find((p) => p.id === bld?.parcelId) || SEED_PARCELS[0];
    const bldCode = getBuildingShortCode(bld);
    const parcelRef = draft.parcelReference || parcel?.demoUlpinReference || 'DEMO-MH-MUM-0001';
    const storyHeight = bld && bld.totalFloors ? (bld.heightM / bld.totalFloors) : 3.4;
    const podiumHeight = 1.2;
    const zBottom = podiumHeight + (f - 1) * storyHeight;
    const zTop = zBottom + storyHeight;
    const volume = Number((draft.builtupAreaSqm * storyHeight).toFixed(1));
    const prototypeVsuIdentifier = `${parcelRef}-VSU-${bldCode}-${String(f).padStart(2, '0')}-${draft.unitNumber}`;

    const cleanSurvey = parcel?.surveyNumber ? parcel.surveyNumber.replace(/[^A-Z0-9]/g, '') : 'CTS98122A';
    const canonical3dUlpin = draft.canonical3dUlpin || `ULPIN3D-MH-${cleanSurvey}-${bldCode}-F${String(f).padStart(2, '0')}-U${draft.unitNumber}-Z${zBottom.toFixed(1)}_${zTop.toFixed(1)}`;

    const newVsu: CandidateVsu = {
      id: `vsu-new-${Date.now()}`,
      buildingId: draft.buildingId,
      floorId: `floor-${f}`,
      floorNumber: f,
      prototypeVsuIdentifier,
      canonical3dUlpin,
      unitNumber: draft.unitNumber,
      unitName: draft.unitName,
      useType: draft.useType,
      carpetAreaSqm: draft.carpetAreaSqm,
      builtupAreaSqm: draft.builtupAreaSqm,
      volumeCum: volume,
      zBottomM: zBottom,
      zTopM: zTop,
      confidenceTier: draft.confidenceTier as any,
      verificationStatus: 'Under Review',
      mockDocumentReference: draft.mockDocumentReference,
      mockOccupantName: draft.mockOccupantName,
    };

    // Cache statutory 3D-ULPIN in fast registry
    VSU_ULPIN_REGISTRY.set(prototypeVsuIdentifier, canonical3dUlpin);
    VSU_ULPIN_REGISTRY.set(newVsu.id, canonical3dUlpin);

    // Unconditionally update in-memory seed cache for immediate UI reactivity
    // Match by prototypeVsuIdentifier OR by (buildingId + floorNumber + unitNumber)
    const cleanUnit = draft.unitNumber.replace(/\D/g, '');
    const existingVsuIdx = SEED_VSUS.findIndex(
      (v) =>
        v.prototypeVsuIdentifier === prototypeVsuIdentifier ||
        v.id === newVsu.id ||
        (v.buildingId === draft.buildingId &&
          v.floorNumber === f &&
          (v.unitNumber === draft.unitNumber || v.unitNumber.replace(/\D/g, '') === cleanUnit))
    );
    if (existingVsuIdx >= 0) {
      newVsu.id = SEED_VSUS[existingVsuIdx].id;
      SEED_VSUS.splice(existingVsuIdx, 1);
    }

    // Purge any rogue duplicate records for the same flat in SEED_VSUS
    for (let i = SEED_VSUS.length - 1; i >= 0; i--) {
      const v = SEED_VSUS[i];
      const isSameBuilding =
        v.buildingId === draft.buildingId ||
        (draft.buildingId === 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' &&
          (v.prototypeVsuIdentifier.includes('GREEN') || v.prototypeVsuIdentifier.includes('GRN')));
      if (
        isSameBuilding &&
        v.floorNumber === f &&
        (v.unitNumber === draft.unitNumber || v.unitNumber.replace(/\D/g, '') === cleanUnit)
      ) {
        SEED_VSUS.splice(i, 1);
      }
    }
    SEED_VSUS.unshift(newVsu);

    // Purge any rogue duplicate tasks
    for (let i = SEED_TASKS.length - 1; i >= 0; i--) {
      const t = SEED_TASKS[i];
      if (
        t.vsuIdentifier === prototypeVsuIdentifier ||
        t.vsuId === newVsu.id ||
        (t.vsuIdentifier && t.vsuIdentifier.includes(`-${String(f).padStart(2, '0')}-${draft.unitNumber}`))
      ) {
        SEED_TASKS.splice(i, 1);
      }
    }
    SEED_TASKS.unshift({
      id: `task-${Date.now()}`,
      vsuId: newVsu.id,
      vsuIdentifier: prototypeVsuIdentifier,
      verificationStatus: 'Under Review',
      officerNotes: 'Candidate vertical unit submitted for verification.',
      checklistResults: {
        manifold2d: true,
        boundaryWithinBuilding: true,
        verticalClearanceValid: true,
        noVsuOverlap: true,
        deedTolerancePassed: true,
      },
      assignedOfficer: 'Officer A. Patil (Zone 4)',
      updatedAt: 'Just now',
    });

    // Log genesis audit event
    await this.logAuditEvent({
      vsuId: newVsu.id,
      eventTitle: 'Candidate Vertical Record Submitted',
      eventType: 'CANDIDATE_REGISTRATION',
      performedBy: 'Applicant / Surveyor R. Shinde',
      userRole: this.activeRole,
      description: `Draft VSU registered for Unit ${draft.unitNumber} (${draft.carpetAreaSqm} m²). Initial verification task created.`,
    });

    if (!isSupabaseConfigured) {
      return newVsu;
    }

    try {
      // 1. Resolve actual floor UUID in database
      let floorId: string | null = null;
      if (draft.buildingId) {
        const { data: floorData } = await supabase
          .from('floors')
          .select('id')
          .eq('building_id', draft.buildingId)
          .eq('floor_number', f)
          .maybeSingle();

        if (floorData?.id) {
          floorId = floorData.id;
        } else {
          // Fallback to any existing floor for this building
          const { data: anyFloor } = await supabase
            .from('floors')
            .select('id')
            .eq('building_id', draft.buildingId)
            .limit(1)
            .maybeSingle();
          if (anyFloor?.id) floorId = anyFloor.id;
        }
      }

      if (!floorId) {
        // If no floor exists yet in DB, create one
        const { data: newFloor } = await supabase
          .from('floors')
          .insert({
            building_id: draft.buildingId,
            floor_number: f,
            floor_label: `${f}th Floor Level`,
            z_bottom_m: zBottom,
            z_top_m: zTop,
            floor_height_m: 3.4,
          })
          .select('id')
          .single();
        if (newFloor?.id) floorId = newFloor.id;
      }

      // Clean up any legacy or rogue GREENRES rows in Supabase for this unit
      if (draft.buildingId) {
        try {
          await supabase
            .from('vertical_sub_units')
            .delete()
            .eq('building_id', draft.buildingId)
            .like('prototype_vsu_identifier', '%-GREENRES-%')
            .eq('unit_number', draft.unitNumber);
        } catch {
          // Non-blocking cleanup
        }
      }

      // 2. Upsert candidate VSU in Supabase (eliminating duplicate key constraint conflicts)
      const { data: vsuRecord, error: upsertError } = await supabase
        .from('vertical_sub_units')
        .upsert(
          [
            {
              building_id: draft.buildingId,
              floor_id: floorId,
              prototype_vsu_identifier: prototypeVsuIdentifier,
              unit_number: draft.unitNumber,
              unit_name: draft.unitName,
              use_type: draft.useType,
              carpet_area_sqm: draft.carpetAreaSqm,
              builtup_area_sqm: draft.builtupAreaSqm,
              volume_cum: volume,
              z_bottom_m: zBottom,
              z_top_m: zTop,
              confidence_tier: draft.confidenceTier,
              verification_status: 'Under Review',
              mock_document_reference: draft.mockDocumentReference,
              mock_occupant_name: draft.mockOccupantName,
            },
          ],
          { onConflict: 'prototype_vsu_identifier' }
        )
        .select()
        .single();

      if (upsertError || !vsuRecord) {
        console.warn('Supabase candidate VSU upsert note (using local cache):', upsertError);
        return newVsu;
      }

      newVsu.id = vsuRecord.id;
      VSU_ULPIN_REGISTRY.set(vsuRecord.id, canonical3dUlpin);

      // 3. Create or update linked verification task in Supabase
      const { data: existingTasks } = await supabase
        .from('verification_tasks')
        .select('id')
        .eq('vsu_id', vsuRecord.id);

      if (existingTasks && existingTasks.length > 0) {
        await supabase
          .from('verification_tasks')
          .update({
            verification_status: 'Under Review',
            officer_notes: 'Candidate vertical unit re-submitted for verification.',
            updated_at: new Date().toISOString(),
          })
          .eq('vsu_id', vsuRecord.id);
      } else {
        await supabase.from('verification_tasks').insert({
          vsu_id: vsuRecord.id,
          verification_status: 'Under Review',
          assigned_officer: 'Officer A. Patil (Zone 4)',
          officer_notes: 'Candidate vertical unit submitted for verification.',
          checklist_results: {
            manifold2d: true,
            boundaryWithinBuilding: true,
            verticalClearanceValid: true,
            noVsuOverlap: true,
            deedTolerancePassed: true,
          },
        });
      }

      // Log genesis audit event with real database VSU ID
      await this.logAuditEvent({
        vsuId: vsuRecord.id,
        eventTitle: 'Candidate Vertical Record Submitted',
        eventType: 'CANDIDATE_REGISTRATION',
        performedBy: 'Applicant / Surveyor R. Shinde',
        userRole: this.activeRole,
        description: `Draft VSU registered for Unit ${draft.unitNumber} (${draft.carpetAreaSqm} m²). Initial verification task created.`,
      });

      return {
        id: vsuRecord.id,
        buildingId: vsuRecord.building_id,
        floorId: vsuRecord.floor_id,
        floorNumber: f,
        prototypeVsuIdentifier: vsuRecord.prototype_vsu_identifier,
        canonical3dUlpin,
        unitNumber: vsuRecord.unit_number,
        unitName: vsuRecord.unit_name,
        useType: vsuRecord.use_type,
        carpetAreaSqm: Number(vsuRecord.carpet_area_sqm),
        builtupAreaSqm: Number(vsuRecord.builtup_area_sqm),
        volumeCum: Number(vsuRecord.volume_cum),
        zBottomM: Number(vsuRecord.z_bottom_m),
        zTopM: Number(vsuRecord.z_top_m),
        confidenceTier: vsuRecord.confidence_tier,
        verificationStatus: vsuRecord.verification_status,
        mockDocumentReference: vsuRecord.mock_document_reference,
        mockOccupantName: vsuRecord.mock_occupant_name,
      };
    } catch (err) {
      console.warn('createCandidateVsu database operation caught:', err);
      return newVsu;
    }
  }

  // 12. Fetch Audit Events for VSU
  async getAuditTrail(vsuId?: string): Promise<AuditEvent[]> {
    const isVsuUuid = vsuId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vsuId) : false;
    if (!isSupabaseConfigured || (vsuId && !isVsuUuid)) {
      return vsuId ? SEED_AUDIT_EVENTS.filter((e) => e.vsuId === vsuId) : SEED_AUDIT_EVENTS;
    }
    try {
      let query = supabase.from('audit_events').select('*').order('created_at', { ascending: false });
      if (vsuId && isVsuUuid) query = query.eq('vsu_id', vsuId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return vsuId ? SEED_AUDIT_EVENTS.filter((e) => e.vsuId === vsuId) : SEED_AUDIT_EVENTS;
      }

      return data.map((a: any) => ({
        id: a.id,
        vsuId: a.vsu_id,
        eventTitle: a.event_title,
        eventType: a.event_type,
        performedBy: a.performed_by,
        userRole: a.user_role,
        description: a.description,
        createdAt: a.created_at,
      }));
    } catch {
      return vsuId ? SEED_AUDIT_EVENTS.filter((e) => e.vsuId === vsuId) : SEED_AUDIT_EVENTS;
    }
  }

  // 13. Log Audit Event (Append-only)
  async logAuditEvent(event: {
    vsuId?: string;
    eventTitle: string;
    eventType: string;
    performedBy: string;
    userRole: string;
    description: string;
  }): Promise<void> {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      ...event,
      createdAt: 'Just now',
    };
    SEED_AUDIT_EVENTS.unshift(newEvent);

    if (isSupabaseConfigured) {
      try {
        const isVsuUuid = event.vsuId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.vsuId) : false;
        await supabase.from('audit_events').insert([
          {
            vsu_id: isVsuUuid ? event.vsuId : null,
            event_title: event.eventTitle,
            event_type: event.eventType,
            performed_by: event.performedBy,
            user_role: event.userRole,
            description: event.description,
          },
        ]);
      } catch {
        // Fallback already logged in SEED_AUDIT_EVENTS
      }
    }
  }
}

export const cadastreService = new CadastreService();
