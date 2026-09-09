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
    if (!isSupabaseConfigured) {
      let list = SEED_VSUS;
      if (buildingId) list = list.filter((v) => v.buildingId === buildingId);
      if (floorNumber) list = list.filter((v) => v.floorNumber === floorNumber);
      return list;
    }
    try {
      let query = supabase.from('vertical_sub_units').select('*');
      if (buildingId) query = query.eq('building_id', buildingId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_VSUS;

      return data.map((v: any) => ({
        id: v.id,
        buildingId: v.building_id,
        floorId: v.floor_id,
        floorNumber: parseInt(v.unit_number.slice(0, -2) || '1', 10),
        prototypeVsuIdentifier: v.prototype_vsu_identifier,
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
        hasViolation: v.verification_status === 'Draft' && v.unit_number === '602',
        geometry: v.geometry,
      }));
    } catch {
      return SEED_VSUS;
    }
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
    if (!isSupabaseConfigured) return SEED_EVIDENCE;
    try {
      let query = supabase.from('evidence_sources').select('*');
      if (buildingId) query = query.eq('building_id', buildingId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_EVIDENCE;

      return data.map((e: any) => ({
        id: e.id,
        buildingId: e.building_id,
        vsuId: e.vsu_id,
        sourceType: e.source_type,
        title: e.title,
        description: e.description,
        fileUrl: e.file_url,
        sensorGsd: e.sensor_gsd,
        concurrenceScore: Number(e.concurrence_score),
        captureDate: e.capture_date,
        metadata: e.metadata,
      }));
    } catch {
      return SEED_EVIDENCE;
    }
  }

  // 7. Fetch Discrepancy Alerts
  async getDiscrepancyAlerts(): Promise<DiscrepancyAlert[]> {
    if (!isSupabaseConfigured) return SEED_ALERTS;
    try {
      const { data, error } = await supabase.from('discrepancy_alerts').select('*');
      if (error || !data || data.length === 0) return SEED_ALERTS;

      return data.map((a: any) => ({
        id: a.id,
        buildingId: a.building_id,
        vsuId: a.vsu_id,
        alertCode: a.alert_code,
        alertType: a.alert_type,
        severity: a.severity,
        heightDeltaM: Number(a.height_delta_m || 0),
        footprintDeltaSqm: Number(a.footprint_delta_sqm || 0),
        description: a.description,
        status: a.status,
      }));
    } catch {
      return SEED_ALERTS;
    }
  }

  // 8. Fetch Satellite Observations
  async getSatelliteObservations(buildingId: string): Promise<SatelliteObservation[]> {
    if (!isSupabaseConfigured) return SEED_SATELLITE_OBS;
    try {
      const { data, error } = await supabase
        .from('satellite_observations')
        .select('*')
        .eq('building_id', buildingId)
        .order('capture_date', { ascending: true });

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
    if (!isSupabaseConfigured) return SEED_TASKS;
    try {
      const { data, error } = await supabase
        .from('verification_tasks')
        .select('*, vertical_sub_units(prototype_vsu_identifier)');

      if (error || !data || data.length === 0) return SEED_TASKS;

      return data.map((t: any) => ({
        id: t.id,
        vsuId: t.vsu_id,
        vsuIdentifier: t.vertical_sub_units?.prototype_vsu_identifier,
        verificationStatus: t.verification_status,
        officerNotes: t.officer_notes,
        checklistResults: t.checklist_results,
        assignedOfficer: t.assigned_officer,
        updatedAt: t.updated_at,
      }));
    } catch {
      return SEED_TASKS;
    }
  }

  // 10. Update Verification Task (Approve, Reject, Notes)
  async updateVerificationTask(
    taskId: string,
    vsuId: string,
    status: 'Approved' | 'Rejected' | 'Returned for Correction' | 'Under Review',
    officerNotes: string
  ): Promise<boolean> {
    // Also append an immutable audit log
    await this.logAuditEvent({
      vsuId,
      eventTitle: `Verification Status Updated to ${status}`,
      eventType: 'VERIFICATION_UPDATE',
      performedBy: this.activeRole === 'municipal_officer' ? 'Officer A. Patil' : 'Demo User',
      userRole: this.activeRole,
      description: officerNotes || `Status updated to ${status}`,
    });

    if (!isSupabaseConfigured) {
      const task = SEED_TASKS.find((t) => t.id === taskId || t.vsuId === vsuId);
      if (task) {
        task.verificationStatus = status;
        task.officerNotes = officerNotes;
        task.updatedAt = 'Just now';
      }
      const vsu = SEED_VSUS.find((v) => v.id === vsuId);
      if (vsu) vsu.verificationStatus = status;
      return true;
    }

    try {
      await supabase
        .from('verification_tasks')
        .update({
          verification_status: status,
          officer_notes: officerNotes,
          updated_at: new Date().toISOString(),
        })
        .match({ vsu_id: vsuId });

      await supabase
        .from('vertical_sub_units')
        .update({ verification_status: status })
        .match({ id: vsuId });

      return true;
    } catch {
      return false;
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
  }): Promise<CandidateVsu> {
    const f = draft.floorNumber;
    const zBottom = 1.2 + (f - 1) * 3.4;
    const zTop = zBottom + 3.4;
    const volume = Number((draft.builtupAreaSqm * 3.4).toFixed(1));
    const prototypeVsuIdentifier = `DEMO-MH-MUM-0001-VSU-A-${String(f).padStart(2, '0')}-${draft.unitNumber}`;

    const newVsu: CandidateVsu = {
      id: `vsu-new-${Date.now()}`,
      buildingId: draft.buildingId,
      floorId: `floor-${f}`,
      floorNumber: f,
      prototypeVsuIdentifier,
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

    // Log Genesis Audit Event
    await this.logAuditEvent({
      vsuId: newVsu.id,
      eventTitle: 'Candidate Vertical Record Submitted',
      eventType: 'CANDIDATE_REGISTRATION',
      performedBy: 'Applicant / Surveyor R. Shinde',
      userRole: this.activeRole,
      description: `Draft VSU registered for Unit ${draft.unitNumber} (${draft.carpetAreaSqm} m²). Initial verification task created.`,
    });

    if (!isSupabaseConfigured) {
      SEED_VSUS.unshift(newVsu);
      SEED_TASKS.unshift({
        id: `task-${Date.now()}`,
        vsuId: newVsu.id,
        vsuIdentifier: prototypeVsuIdentifier,
        verificationStatus: 'Under Review',
        officerNotes: 'Newly registered candidate unit awaiting document scrutiny.',
        checklistResults: {
          manifold2d: true,
          boundaryWithinBuilding: true,
          verticalClearanceValid: true,
          noVsuOverlap: true,
          deedTolerancePassed: true,
        },
        assignedOfficer: 'Officer Pending Allocation',
        updatedAt: 'Just now',
      });
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

      const { data: vsuRecord, error: insertError } = await supabase
        .from('vertical_sub_units')
        .insert([
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
        ])
        .select()
        .single();

      if (insertError || !vsuRecord) {
        console.warn('Supabase candidate VSU insert failed, falling back to local memory:', insertError);
        return newVsu;
      }

      // Create linked verification task in Supabase
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
    } catch {
      return newVsu;
    }
  }

  // 12. Fetch Audit Events for VSU
  async getAuditTrail(vsuId?: string): Promise<AuditEvent[]> {
    if (!isSupabaseConfigured) {
      return vsuId ? SEED_AUDIT_EVENTS.filter((e) => e.vsuId === vsuId) : SEED_AUDIT_EVENTS;
    }
    try {
      let query = supabase.from('audit_events').select('*').order('created_at', { ascending: false });
      if (vsuId) query = query.eq('vsu_id', vsuId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) return SEED_AUDIT_EVENTS;

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
      return SEED_AUDIT_EVENTS;
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
        await supabase.from('audit_events').insert([
          {
            vsu_id: event.vsuId,
            event_title: event.eventTitle,
            event_type: event.eventType,
            performed_by: event.performedBy,
            user_role: event.userRole,
            description: event.description,
          },
        ]);
      } catch {
        // Fallback already logged
      }
    }
  }
}

export const cadastreService = new CadastreService();
