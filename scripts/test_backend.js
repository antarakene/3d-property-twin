import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ogwiymbotfdskcrmdabw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2l5bWJvdGZkc2tjcm1kYWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4OTQ5MDUsImV4cCI6MjEwNDQ3MDkwNX0.dRMs3jYarWR8XgQ7RWf06FQFUn7dHfGMuwASFBHaV_Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runBackendTests() {
  console.log('================================================================');
  console.log('       NAGARDRISHTI 3D — AUTOMATED BACKEND TEST SUITE           ');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Parent Parcels Query
    // -------------------------------------------------------------
    console.log('[Suite 1: Parent Parcels & Cadastral Boundaries]');
    const { data: parcels, error: pErr } = await supabase
      .from('parent_parcels')
      .select('*')
      .order('demo_ulpin_reference');

    assert(!pErr, 'Query parent_parcels table without error');
    assert(parcels && parcels.length >= 3, `Found ${parcels?.length || 0} parcels (expected >= 3)`);
    const ulpins = parcels?.map(p => p.demo_ulpin_reference) || [];
    assert(ulpins.includes('DEMO-MH-MUM-0001'), 'Includes primary parcel DEMO-MH-MUM-0001');
    assert(ulpins.includes('DEMO-MH-MUM-0002'), 'Includes parcel DEMO-MH-MUM-0002');
    assert(ulpins.includes('DEMO-MH-MUM-0003'), 'Includes parcel DEMO-MH-MUM-0003');

    // -------------------------------------------------------------
    // Test 2: Buildings Query & Attributes
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Buildings & Vertical Structures]');
    const { data: buildings, error: bErr } = await supabase
      .from('buildings')
      .select('*');

    assert(!bErr, 'Query buildings table without error');
    assert(buildings && buildings.length >= 5, `Found ${buildings?.length || 0} buildings (expected >= 5)`);
    const towerA = buildings?.find(b => b.building_code === 'TOWER-A');
    assert(!!towerA, 'Tower A (TOWER-A) exists in database');
    assert(towerA?.total_floors === 10, 'Tower A has 10 above-ground floors');
    assert(towerA?.status === 'Verified', 'Tower A status is Verified');

    const towerB = buildings?.find(b => b.building_code === 'TOWER-B');
    assert(!!towerB, 'Tower B (TOWER-B) exists in database');
    assert(towerB?.status === 'Under Review', 'Tower B status is Under Review');

    // -------------------------------------------------------------
    // Test 3: Floors & Vertical Sub-Units (VSUs)
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Floors & Candidate Vertical Sub-Units]');
    const { data: floors, error: fErr } = await supabase
      .from('floors')
      .select('*')
      .eq('building_id', towerA?.id)
      .order('floor_number');

    assert(!fErr, 'Query floors table without error');
    assert(floors && floors.length === 10, `Found ${floors?.length || 0} floors for Tower A (expected 10)`);

    const { data: vsus, error: vErr } = await supabase
      .from('vertical_sub_units')
      .select('*')
      .eq('building_id', towerA?.id);

    assert(!vErr, 'Query vertical_sub_units table without error');
    assert(vsus && vsus.length >= 40, `Found ${vsus?.length || 0} VSUs for Tower A (expected >= 40)`);
    const unit101 = vsus?.find(u => u.unit_number === '101');
    assert(!!unit101, 'Unit 101 exists on Floor 1');
    assert(unit101?.z_bottom_m !== undefined && unit101?.z_top_m !== undefined, 'Unit 101 has valid Z-range elevations');
    assert(unit101?.volume_cum > 0, `Unit 101 has calculated volume: ${unit101?.volume_cum} m³`);

    // -------------------------------------------------------------
    // Test 4: Discrepancy Alerts
    // -------------------------------------------------------------
    console.log('\n[Suite 4: Discrepancy & Fraud-Risk Detection]');
    const { data: alerts, error: aErr } = await supabase
      .from('discrepancy_alerts')
      .select('*');

    assert(!aErr, 'Query discrepancy_alerts table without error');
    assert(alerts && alerts.length >= 3, `Found ${alerts?.length || 0} discrepancy alerts (expected >= 3)`);
    const rooftopAlert = alerts?.find(a => a.alert_code === 'ALT-2026-0042');
    assert(!!rooftopAlert, 'Alert ALT-2026-0042 (Rooftop Extension) exists');
    assert(Number(rooftopAlert?.height_delta_m) === 4.3, `Rooftop Z-deviation is +4.3m (actual: ${rooftopAlert?.height_delta_m}m)`);
    assert(rooftopAlert?.severity === 'High', 'Rooftop alert severity is High');

    // -------------------------------------------------------------
    // Test 5: Satellite & Survey Observations
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Sensor Observations & Evidence]');
    const { data: satObs, error: satErr } = await supabase
      .from('satellite_observations')
      .select('*');
    assert(!satErr, 'Query satellite_observations table without error');
    assert(satObs && satObs.length >= 2, `Found ${satObs?.length || 0} satellite observation epochs`);

    const { data: surveyObs, error: surErr } = await supabase
      .from('survey_observations')
      .select('*');
    assert(!surErr, 'Query survey_observations table without error');
    assert(surveyObs && surveyObs.length >= 1, `Found ${surveyObs?.length || 0} survey MMS observations`);

    // -------------------------------------------------------------
    // Test 6: Candidate VSU Mutation (Insert, Verification Task, Audit Event, Cleanup)
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Candidate Registration Mutation & Verification Workflow]');
    const testFloor = floors ? floors[0] : null;
    const testIdentifier = `DEMO-TEST-UNIT-${Date.now()}`;
    const testVsuData = {
      building_id: towerA?.id,
      floor_id: testFloor?.id,
      unit_number: '999',
      unit_name: 'Test Automated Suite 999',
      prototype_vsu_identifier: testIdentifier,
      use_type: 'Commercial Automated Test',
      carpet_area_sqm: 105.5,
      builtup_area_sqm: 125.0,
      volume_cum: 425.0,
      z_bottom_m: 28.4,
      z_top_m: 31.8,
      verification_status: 'Under Review',
      mock_document_reference: 'TEST-DEED-2026',
      mock_occupant_name: 'Automated Test Runner',
      confidence_tier: 'Tier A'
    };

    const { data: insertedVsu, error: insErr } = await supabase
      .from('vertical_sub_units')
      .insert(testVsuData)
      .select()
      .single();

    assert(!insErr, `Insert candidate VSU into database: ${insErr ? insErr.message : 'OK'}`);
    assert(insertedVsu?.prototype_vsu_identifier === testIdentifier, 'Inserted VSU retrieved with matching identifier');

    if (insertedVsu?.id) {
      // Create verification task for test VSU
      const { data: newTask, error: taskErr } = await supabase
        .from('verification_tasks')
        .insert({
          vsu_id: insertedVsu.id,
          verification_status: 'Under Review',
          assigned_officer: 'Officer Test Inspector (Zone 4)',
          officer_notes: 'Automated test initial review',
          checklist_results: {
            pointCloudMatch: true,
            blueprintMatch: true,
            setbackCompliant: true,
            documentValid: true
          }
        })
        .select()
        .single();

      assert(!taskErr, `Create verification task: ${taskErr ? taskErr.message : 'OK'}`);
      assert(newTask?.verification_status === 'Under Review', 'Task initialized in Under Review status');

      // Update task to Approved
      const { data: updatedTask, error: updateErr } = await supabase
        .from('verification_tasks')
        .update({
          verification_status: 'Approved',
          officer_notes: 'Approved via Automated Test Pipeline'
        })
        .eq('id', newTask.id)
        .select()
        .single();

      assert(!updateErr, `Update verification task to Approved: ${updateErr ? updateErr.message : 'OK'}`);
      assert(updatedTask?.verification_status === 'Approved', 'Task status successfully updated to Approved');

      // Append Audit Event
      const { data: auditEvent, error: auditErr } = await supabase
        .from('audit_events')
        .insert({
          vsu_id: insertedVsu.id,
          event_title: 'Automated Test Unit Verification Completed',
          event_type: 'TEST_VERIFY',
          performed_by: 'Automated Test Runner',
          user_role: 'municipal_officer',
          description: 'Candidate unit verified in automated test run.'
        })
        .select()
        .single();

      assert(!auditErr, `Append audit event to immutable log: ${auditErr ? auditErr.message : 'OK'}`);
      assert(auditEvent?.user_role === 'municipal_officer', 'Audit record tagged with municipal_officer role');

      // Cleanup test VSU (cascade deletes test task & test audit)
      const { error: delErr } = await supabase
        .from('vertical_sub_units')
        .delete()
        .eq('id', insertedVsu.id);

      assert(!delErr, 'Clean up test record from database');
    }

    // -------------------------------------------------------------
    // Test 7: Immutable Audit Trail Check
    // -------------------------------------------------------------
    console.log('\n[Suite 7: Audit Event Trail & Integrity]');
    const { data: auditLogs, error: logErr } = await supabase
      .from('audit_events')
      .select('*')
      .order('created_at', { ascending: false });

    assert(!logErr, 'Query audit_events table without error');
    assert(auditLogs && auditLogs.length >= 4, `Found ${auditLogs?.length || 0} audit events (expected >= 4)`);
    const roles = auditLogs?.map(a => a.user_role) || [];
    assert(roles.includes('surveyor') || roles.includes('municipal_officer') || roles.includes('admin'), 'Audit trail includes authorized role events');

  } catch (err) {
    console.error('Unexpected error in backend test run:', err);
    testsFailed++;
  }

  console.log('\n================================================================');
  console.log(` BACKEND TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runBackendTests();
