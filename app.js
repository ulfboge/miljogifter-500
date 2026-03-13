/* ─────────────────────────────────────────────────
   Miljögifter i svenska sjöar — app.js
   ───────────────────────────────────────────────── */

   const COLOR_MAP = {
    låg:     '#22c55e',
    måttlig: '#f59e0b',
    hög:     '#ef4444'
  };
  
  const GRADE_LABEL = {
    låg:     'Låg',
    måttlig: 'Måttlig',
    hög:     'Hög'
  };
  
  // ── State ──────────────────────────────────────────
  const state = {
    features: [],          // all GeoJSON features
    visibleIds: new Set(), // feature ids currently shown
    searchQuery: '',
    grades: new Set(['låg', 'måttlig', 'hög']),
    selectedGifter: new Set()
  };
  
  let map;
  let popup;
  
  // ── Inbäddad GeoJSON-data (undviker CORS vid lokal öppning) ────────────
  const SJOAR_DATA = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[17.4667,59.5333]},"properties":{"namn":"Mälaren","foroReningsgrad":"måttlig","gifter":["PFAS","kvicksilver","PCB"],"senast_provtagen":"2024-08-15","lan":"Stockholm"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.5,58.3833]},"properties":{"namn":"Vänern","foroReningsgrad":"låg","gifter":["kvicksilver","kadmium"],"senast_provtagen":"2024-07-20","lan":"Västra Götaland"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[14.5667,58.35]},"properties":{"namn":"Vättern","foroReningsgrad":"låg","gifter":["PFAS","dioxiner"],"senast_provtagen":"2024-09-03","lan":"Jönköping"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[14.9167,56.9167]},"properties":{"namn":"Hjälmaren","foroReningsgrad":"hög","gifter":["PFAS","kvicksilver","bly","kadmium"],"senast_provtagen":"2024-06-10","lan":"Örebro"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[14.75,56.1833]},"properties":{"namn":"Åsnen","foroReningsgrad":"låg","gifter":["kvicksilver"],"senast_provtagen":"2024-05-22","lan":"Kronoberg"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[16.8667,60.5667]},"properties":{"namn":"Dalälvens sjösystem – Runn","foroReningsgrad":"hög","gifter":["PFAS","kvicksilver","dioxiner","PCB"],"senast_provtagen":"2024-10-01","lan":"Dalarna"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[18.1833,59.45]},"properties":{"namn":"Baggensfjärden","foroReningsgrad":"hög","gifter":["TBT","PCB","bly"],"senast_provtagen":"2024-04-15","lan":"Stockholm"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[12.0167,57.7]},"properties":{"namn":"Landvettersjön","foroReningsgrad":"hög","gifter":["PFAS"],"senast_provtagen":"2024-11-08","lan":"Västra Götaland"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[15.6167,59.3667]},"properties":{"namn":"Tisaren","foroReningsgrad":"måttlig","gifter":["kvicksilver","kadmium"],"senast_provtagen":"2024-07-30","lan":"Örebro"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[20.3,63.8333]},"properties":{"namn":"Degernässjön","foroReningsgrad":"måttlig","gifter":["kvicksilver","PCB"],"senast_provtagen":"2024-08-20","lan":"Västernorrland"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[17.95,62.6333]},"properties":{"namn":"Nätrasjön","foroReningsgrad":"låg","gifter":["kvicksilver"],"senast_provtagen":"2024-06-05","lan":"Västernorrland"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[19.65,64.7667]},"properties":{"namn":"Storuman","foroReningsgrad":"låg","gifter":["kadmium"],"senast_provtagen":"2024-05-15","lan":"Västerbotten"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[22.5,65.8]},"properties":{"namn":"Uddjaure","foroReningsgrad":"låg","gifter":["kvicksilver"],"senast_provtagen":"2024-07-12","lan":"Norrbotten"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[16.0333,56.6667]},"properties":{"namn":"Emån – Försjön","foroReningsgrad":"måttlig","gifter":["kvicksilver","bly"],"senast_provtagen":"2024-09-18","lan":"Kalmar"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[12.9667,55.5833]},"properties":{"namn":"Kvarnbysjön","foroReningsgrad":"hög","gifter":["PFAS","bly","kadmium","PCB"],"senast_provtagen":"2024-03-25","lan":"Skåne"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.8333,55.9167]},"properties":{"namn":"Ringsjön","foroReningsgrad":"måttlig","gifter":["kvicksilver","PFAS"],"senast_provtagen":"2024-08-05","lan":"Skåne"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[14.1833,58.0167]},"properties":{"namn":"Bunn","foroReningsgrad":"låg","gifter":["kadmium"],"senast_provtagen":"2024-06-28","lan":"Jönköping"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[16.5167,57.4333]},"properties":{"namn":"Örken","foroReningsgrad":"måttlig","gifter":["kvicksilver","dioxiner"],"senast_provtagen":"2024-10-14","lan":"Kalmar"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[11.8333,57.5]},"properties":{"namn":"Sisjön","foroReningsgrad":"hög","gifter":["PFAS","dioxiner","PCB"],"senast_provtagen":"2024-11-20","lan":"Västra Götaland"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[18.6667,59.85]},"properties":{"namn":"Erken","foroReningsgrad":"låg","gifter":["kvicksilver"],"senast_provtagen":"2024-07-08","lan":"Uppsala"}}]};
  
  // ── Init ───────────────────────────────────────────
  async function init() {
    // Init map
    map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: [15.5, 62.5],
      zoom: 4.8
    });
  
    popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px'
    });
  
    const geojson = SJOAR_DATA;
  
    // Assign stable id both as f.id and as property (for MapLibre filter)
    geojson.features.forEach((f, i) => {
      f.id = i;
      f.properties._id = i;
    });
    state.features = geojson.features;
    state.visibleIds = new Set(geojson.features.map(f => f.properties._id));
  
    map.on('load', () => {
      addMapLayers(geojson);
      buildGifterTags();
      buildLakeList();
      attachEvents();
      updateResultCount();
    });
  }
  
  // ── Map layers ─────────────────────────────────────
  function addMapLayers(geojson) {
    map.addSource('sjoar', {
      type: 'geojson',
      data: geojson
    });
  
    // Shadow / halo
    map.addLayer({
      id: 'sjoar-halo',
      type: 'circle',
      source: 'sjoar',
      paint: {
        'circle-radius': 16,
        'circle-color': [
          'match', ['get', 'foroReningsgrad'],
          'låg',     COLOR_MAP.låg,
          'måttlig', COLOR_MAP.måttlig,
          'hög',     COLOR_MAP.hög,
          '#999'
        ],
        'circle-opacity': 0.15
      }
    });
  
    // Main dot
    map.addLayer({
      id: 'sjoar-circle',
      type: 'circle',
      source: 'sjoar',
      paint: {
        'circle-radius': 9,
        'circle-color': [
          'match', ['get', 'foroReningsgrad'],
          'låg',     COLOR_MAP.låg,
          'måttlig', COLOR_MAP.måttlig,
          'hög',     COLOR_MAP.hög,
          '#999'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
  
    // Label
    map.addLayer({
      id: 'sjoar-label',
      type: 'symbol',
      source: 'sjoar',
      layout: {
        'text-field': ['get', 'namn'],
        'text-font': ['Open Sans Regular'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#f1f5f9',
        'text-halo-color': '#0f172a',
        'text-halo-width': 1.5
      }
    });
  
    // Click
    map.on('click', 'sjoar-circle', e => {
      const f = e.features[0];
      openPopup(f.geometry.coordinates, f.properties);
    });
  
    map.on('mouseenter', 'sjoar-circle', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'sjoar-circle', () => {
      map.getCanvas().style.cursor = '';
    });
  }
  
  // ── Popup ──────────────────────────────────────────
  function openPopup(coords, props) {
    const gifter = parseGifter(props.gifter);
    const pills  = gifter.map(g => `<span class="pill">${g}</span>`).join('');
    const grade  = props.foroReningsgrad;
  
    const html = `
      <div class="popup-header">
        <h3>🏞 ${props.namn}</h3>
        <span class="badge ${grade}">${GRADE_LABEL[grade] ?? grade}</span>
      </div>
      <div class="popup-body">
        <div class="popup-row">
          <span class="label">Län</span>
          <span class="value">${props.lan}</span>
        </div>
        <div class="popup-row">
          <span class="label">Föroreningsgrad</span>
          <span class="value">${GRADE_LABEL[grade] ?? grade}</span>
        </div>
        <div class="popup-row">
          <span class="label">Senast provtagen</span>
          <span class="value">${props.senast_provtagen}</span>
        </div>
        <div class="popup-row" style="flex-direction:column;gap:0.4rem;">
          <span class="label">Gifter</span>
          <div class="gifter-pills">${pills}</div>
        </div>
      </div>`;
  
    popup.setLngLat(coords).setHTML(html).addTo(map);
  }
  
  // ── Gifter tag cloud ───────────────────────────────
  function buildGifterTags() {
    const allGifter = new Set();
    state.features.forEach(f => parseGifter(f.properties.gifter).forEach(g => allGifter.add(g)));
  
    const container = document.getElementById('gifter-tags');
    container.innerHTML = '';
  
    [...allGifter].sort().forEach(g => {
      const tag = document.createElement('span');
      tag.className = 'gift-tag';
      tag.textContent = g;
      tag.dataset.gift = g;
      tag.addEventListener('click', () => toggleGiftFilter(g, tag));
      container.appendChild(tag);
    });
  }
  
  function toggleGiftFilter(gift, el) {
    if (state.selectedGifter.has(gift)) {
      state.selectedGifter.delete(gift);
      el.classList.remove('active');
    } else {
      state.selectedGifter.add(gift);
      el.classList.add('active');
    }
    applyFilters();
  }
  
  // ── Lake list ──────────────────────────────────────
  function buildLakeList() {
    const list = document.getElementById('lake-list');
    list.innerHTML = '';
  
    const visible = state.features.filter(f => state.visibleIds.has(f.properties._id));
    visible.forEach(f => {
      const p = f.properties;
      const item = document.createElement('div');
      item.className = 'lake-item';
      item.dataset.id = f.id;
      item.innerHTML = `
        <span class="dot ${p.foroReningsgrad}"></span>
        <span class="lake-name">${p.namn}</span>
        <span class="lake-lan">${p.lan}</span>`;
      item.addEventListener('click', () => {
        map.flyTo({ center: f.geometry.coordinates, zoom: 9, speed: 1.4 });
        openPopup(f.geometry.coordinates, p);
      });
      list.appendChild(item);
    });
  }
  
  function updateResultCount() {
    const el = document.getElementById('result-count');
    const n  = state.visibleIds.size;
    const tot = state.features.length;
    el.innerHTML = `Visar <strong>${n}</strong> av ${tot} sjöar`;
  }
  
  // ── Filtering ──────────────────────────────────────
  function applyFilters() {
    const q = state.searchQuery.toLowerCase();
  
    state.visibleIds.clear();
  
    state.features.forEach(f => {
      const p = f.properties;
  
      // Grade filter
      if (!state.grades.has(p.foroReningsgrad)) return;
  
      // Gift filter
      if (state.selectedGifter.size > 0) {
        const gifts = parseGifter(p.gifter);
        const match = [...state.selectedGifter].every(sg => gifts.includes(sg));
        if (!match) return;
      }
  
      // Search filter
      if (q && !p.namn.toLowerCase().includes(q)) return;
  
      state.visibleIds.add(f.properties._id);
    });
  
    // Build filter expression using property _id (works reliably in MapLibre)
    const ids = [...state.visibleIds];
    const filterExpr = ids.length > 0
      ? ['in', ['get', '_id'], ['literal', ids]]
      : ['==', ['get', '_id'], -1];
  
    ['sjoar-circle', 'sjoar-halo', 'sjoar-label'].forEach(layer => {
      map.setFilter(layer, filterExpr);
    });
  
    buildLakeList();
    updateResultCount();
  }
  
  // ── Event bindings ─────────────────────────────────
  function attachEvents() {
    // Search
    document.getElementById('search-input').addEventListener('input', e => {
      state.searchQuery = e.target.value;
      applyFilters();
    });
  
    // Grade checkboxes
    document.querySelectorAll('.grade-check').forEach(cb => {
      cb.addEventListener('change', () => {
        const grade = cb.dataset.grade;
        if (cb.checked) {
          state.grades.add(grade);
        } else {
          state.grades.delete(grade);
        }
        applyFilters();
      });
    });
  
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
  
  // ── Helpers ────────────────────────────────────────
  function parseGifter(raw) {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  }
  
  // ── Boot ───────────────────────────────────────────
  init();