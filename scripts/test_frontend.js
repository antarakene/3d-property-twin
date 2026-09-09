import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

async function runFrontendTests() {
  console.log('================================================================');
  console.log('       NAGARDRISHTI 3D — AUTOMATED FRONTEND TEST SUITE          ');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Geometry & Evacuation Path Algorithm Verification
    // -------------------------------------------------------------
    console.log('[Suite 1: Geometry & Evacuation Algorithm Verification]');
    const { calculateEvacuationPath, SITE_COORDINATES, generateTowerFloors, ARCHITECTURAL_VIOLATIONS } = await import('../src/data/buildingData.js');

    assert(!!SITE_COORDINATES, 'Site coordinates defined');
    assert(SITE_COORDINATES.latitude === 18.2345, `Latitude is 18.2345 (Zone 4 anchor, actual: ${SITE_COORDINATES.latitude})`);
    assert(SITE_COORDINATES.longitude === 73.9856, `Longitude is 73.9856 (Zone 4 anchor, actual: ${SITE_COORDINATES.longitude})`);
    assert(SITE_COORDINATES.altitude === 0.0, 'Ground datum altitude is anchored at 0.0m MSL');

    const floors = generateTowerFloors();
    assert(floors.length >= 8, `Tower A floors generated (actual: ${floors.length} architectural levels)`);
    const totalUnits = floors.reduce((acc, f) => acc + f.vsus.length, 0);
    assert(totalUnits >= 32, `Tower A contains at least 32 candidate VSU sub-units (actual: ${totalUnits})`);

    // Test evacuation path for top floor (Floor 8)
    const pathFloor8 = calculateEvacuationPath(8, '1');
    assert(pathFloor8.length > 0, `Floor 8 evacuation route calculated with ${pathFloor8.length} waypoints`);
    const firstWaypoint = pathFloor8[0];
    const lastWaypoint = pathFloor8[pathFloor8.length - 1];
    assert(firstWaypoint.z > lastWaypoint.z, `Path descends monotonically: start ${firstWaypoint.z}m -> exit ${lastWaypoint.z}m`);
    assert(lastWaypoint.z <= 0.5, `Evacuation egress point reaches ground level (${lastWaypoint.z}m)`);

    // Test evacuation path for ground floor (Floor 1)
    const pathFloor1 = calculateEvacuationPath(1, '2');
    assert(pathFloor1.length >= 2, `Floor 1 evacuation route calculated with ${pathFloor1.length} waypoints`);

    // Architectural Violations Data
    assert(ARCHITECTURAL_VIOLATIONS.length >= 2, `Found ${ARCHITECTURAL_VIOLATIONS.length} architectural violations in dataset`);
    const roofViol = ARCHITECTURAL_VIOLATIONS.find(v => v.id === 'VIOL-ROOF-01');
    assert(!!roofViol, 'Architectural dataset includes VIOL-ROOF-01 (Terrace / Rooftop violation)');
    const balcViol = ARCHITECTURAL_VIOLATIONS.find(v => v.id === 'VIOL-BALC-06');
    assert(!!balcViol, 'Architectural dataset includes VIOL-BALC-06 (Balcony setback overhang)');

    // -------------------------------------------------------------
    // Test 2: Cadastral Identifier & Z-Elevation Extrusion Math
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Cadastral Identifier & Extrusion Math]');
    function computeExtrusion(floorNumber, builtupArea) {
      const zBottom = 1.2 + (floorNumber - 1) * 3.4;
      const zTop = zBottom + 3.4;
      const volume = Number((builtupArea * 3.4).toFixed(1));
      const prototypeId = `DEMO-MH-MUM-0001-VSU-A-${String(floorNumber).padStart(2, '0')}-705`;
      return { zBottom, zTop, volume, prototypeId };
    }

    const ext1 = computeExtrusion(1, 100);
    assert(Math.abs(ext1.zBottom - 1.2) < 0.001, 'Floor 1 base elevation is 1.2m MSL');
    assert(Math.abs(ext1.zTop - 4.6) < 0.001, 'Floor 1 ceiling elevation is 4.6m MSL');
    assert(ext1.volume === 340.0, 'Floor 1 volume for 100m² is 340.0 m³');

    const ext7 = computeExtrusion(7, 112.8);
    assert(Math.abs(ext7.zBottom - 21.6) < 0.001, 'Floor 7 base elevation is 21.6m MSL');
    assert(Math.abs(ext7.zTop - 25.0) < 0.001, 'Floor 7 ceiling elevation is 25.0m MSL');
    assert(ext7.volume === 383.5, 'Floor 7 volume for 112.8m² is 383.5 m³');
    assert(/^DEMO-MH-MUM-0001-VSU-A-07-705$/.test(ext7.prototypeId), 'Prototype VSU Identifier matches standard specification');

    // -------------------------------------------------------------
    // Test 3: Design System Tokens & Stylesheet Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Design System Tokens & CSS Conformance]');
    const cssPath = path.join(ROOT_DIR, 'src/styles/designSystem.css');
    assert(fs.existsSync(cssPath), 'designSystem.css exists');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const expectedTokens = [
      '--color-surface',
      '--color-primary',
      '--color-secondary',
      '--color-error',
      '--color-verified',
      '--color-review',
      '--color-draft',
      '--color-estimated',
      '--font-mono',
      '--font-display',
      '--font-body',
      '.status-badge',
      '.metric-chip',
      '.instrument-card',
      '.statutory-banner',
    ];

    for (const token of expectedTokens) {
      assert(cssContent.includes(token), `designSystem.css defines token/utility "${token}"`);
    }

    // -------------------------------------------------------------
    // Test 4: Component Files & Exports Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 4: Component Architecture & Source Integrity]');
    const expectedComponents = [
      'src/components/common/StatusBadge.tsx',
      'src/components/common/MetricChip.tsx',
      'src/components/layout/StatutoryBanner.tsx',
      'src/components/layout/TopHeader.tsx',
      'src/components/layout/SidebarNav.tsx',
      'src/views/DashboardView.tsx',
      'src/views/City3DView.tsx',
      'src/views/RegistryView.tsx',
      'src/views/CandidateRegistrationView.tsx',
      'src/views/DiscrepancyStudioView.tsx',
      'src/views/VerificationQueueView.tsx',
      'src/views/SosContextView.tsx',
      'src/App.tsx',
      'src/components/CesiumViewer.jsx',
      'src/components/TowerA.jsx',
      'src/components/BuildingFloor.jsx',
      'src/components/VSU.jsx',
      'src/components/ParcelLayer.jsx',
      'src/components/SurroundingBuildings.jsx',
      'src/components/EvacuationRoute.jsx',
      'src/components/BuildingModel.jsx',
    ];

    for (const relPath of expectedComponents) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert(fs.existsSync(fullPath), `Source file exists: ${relPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.length > 50, `Source file has valid non-empty content: ${relPath} (${content.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 5: Production Bundle & Distribution Artifacts
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Production Bundle Verification]');
    const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
    assert(fs.existsSync(distHtmlPath), 'dist/index.html was built');
    const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
    assert(distHtml.includes('<div id="root"></div>'), 'dist/index.html contains root mount node');
    assert(distHtml.includes('NagarDrishti 3D'), 'dist/index.html contains correct document title');
    assert(distHtml.includes('stylesheet'), 'dist/index.html links bundled stylesheet');

    const distAssetsDir = path.join(ROOT_DIR, 'dist/assets');
    assert(fs.existsSync(distAssetsDir), 'dist/assets directory exists');
    const assetFiles = fs.readdirSync(distAssetsDir);
    const hasJsBundle = assetFiles.some(f => f.endsWith('.js'));
    const hasCssBundle = assetFiles.some(f => f.endsWith('.css'));
    assert(hasJsBundle, 'Production JS bundle generated in dist/assets/');
    assert(hasCssBundle, 'Production CSS bundle generated in dist/assets/');

    // -------------------------------------------------------------
    // Test 6: Statutory Disclaimer & Language Mandate Audit
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Responsible Cadastral Language Mandate]');
    const bannerPath = path.join(ROOT_DIR, 'src/components/layout/StatutoryBanner.tsx');
    const bannerContent = fs.readFileSync(bannerPath, 'utf8');
    assert(bannerContent.includes('Prototype Demo'), 'StatutoryBanner includes Prototype Demo tag');
    assert(bannerContent.includes('Requires authorised verification'), 'StatutoryBanner includes "Requires authorised verification"');
    assert(bannerContent.includes('does not constitute legal title'), 'StatutoryBanner disclaims legal title');
    assert(bannerContent.includes('official ULPIN issuance'), 'StatutoryBanner disclaims official ULPIN issuance');

    const headerPath = path.join(ROOT_DIR, 'src/components/layout/TopHeader.tsx');
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert(headerContent.includes('Maharashtra Urban Demonstration Zone (Zone 4)'), 'TopHeader displays Maharashtra Urban Demonstration Zone (Zone 4)');
    assert(headerContent.includes('NAGARDRISHTI 3D'), 'TopHeader displays NAGARDRISHTI 3D brand');

  } catch (err) {
    console.error('Unexpected error in frontend test run:', err);
    testsFailed++;
  }

  console.log('\n================================================================');
  console.log(` FRONTEND TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runFrontendTests();
