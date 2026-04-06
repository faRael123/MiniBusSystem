// Bus data
const buses = [
  {
    id: 'MB-001',
    lat: 15.30,
    lng: 120.89,
    direction: 'Cabiao to Cabanatuan',
    crowdLevel: 'Low',
    nextStop: 'San Isidro',
    eta: '5 min',
    passengers: 8,
    capacity: 20,
  },
  {
    id: 'MB-002',
    lat: 15.42,
    lng: 120.95,
    direction: 'Cabiao to Cabanatuan',
    crowdLevel: 'High',
    nextStop: 'Cabanatuan Terminal',
    eta: '3 min',
    passengers: 18,
    capacity: 20,
  },
  {
    id: 'MB-003',
    lat: 15.38,
    lng: 120.94,
    direction: 'Cabanatuan to Cabiao',
    crowdLevel: 'Medium',
    nextStop: 'Peñaranda',
    eta: '7 min',
    passengers: 12,
    capacity: 20,
  },
  {
    id: 'MB-004',
    lat: 15.25,
    lng: 120.87,
    direction: 'Cabanatuan to Cabiao',
    crowdLevel: 'Low',
    nextStop: 'Cabiao Terminal',
    eta: '12 min',
    passengers: 6,
    capacity: 20,
  },
];

// Route coordinates
const CABIAO = { lat: 15.2467, lng: 120.8589 };
const CABANATUAN = { lat: 15.4894, lng: 120.9672 };

// State
let state = {
  view: 'map',
  showMenu: false,
  map: null,
  busMarkers: new Map(),
};

// Helper function to get crowd color
function getCrowdColor(level) {
  switch (level) {
    case 'Heavy':
      return '#dc2626';
    case 'Moderate':
      return '#f97316';
    case 'Light':
      return '#16a34a';
    // backward-compatibility
    case 'High':
      return '#dc2626';
    case 'Medium':
      return '#f97316';
    case 'Low':
      return '#16a34a';
    default:
      return '#6b7280';
  }
}

// Helper function to create SVG icon for Leaflet
function createBusIcon(crowdLevel) {
  const color = getCrowdColor(crowdLevel);
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="28" height="16" rx="2" fill="${color}"/>
      <rect x="4" y="10" width="6" height="4" fill="white" rx="1"/>
      <rect x="14" y="10" width="6" height="4" fill="white" rx="1"/>
      <circle cx="6" cy="26" r="2" fill="${color}"/>
      <circle cx="26" cy="26" r="2" fill="${color}"/>
    </svg>
  `;
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Initialize map
function initMap() {
  const mapElement = document.getElementById('map');
  
  if (state.map) return;

  state.map = L.map(mapElement, {
    center: [15.37, 120.92],
    zoom: 11,
    zoomControl: false,
  });

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(state.map);

  // Draw route line
  const routeLine = L.polyline(
    [
      [CABIAO.lat, CABIAO.lng],
      [15.28, 120.88],
      [15.32, 120.91],
      [15.38, 120.94],
      [15.45, 120.96],
      [CABANATUAN.lat, CABANATUAN.lng],
    ],
    {
      color: '#dc2626',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5',
    }
  ).addTo(state.map);

  // Add route markers
  L.marker([CABIAO.lat, CABIAO.lng], {
    title: 'Cabiao',
  })
    .bindPopup('<strong>Cabiao Terminal</strong>')
    .addTo(state.map);

  L.marker([CABANATUAN.lat, CABANATUAN.lng], {
    title: 'Cabanatuan',
  })
    .bindPopup('<strong>Cabanatuan Terminal</strong>')
    .addTo(state.map);

  // Add bus markers
  addBusMarkers();

  // Zoom to fit route
  state.map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}

// Add bus markers to map
function addBusMarkers() {
  buses.forEach((bus) => {
    if (!state.busMarkers.has(bus.id)) {
      const marker = L.marker([bus.lat, bus.lng], {
        icon: createBusIcon(bus.crowdLevel),
        title: bus.id,
      })
        .bindPopup(`
          <div style="font-size: 12px;">
            <strong>${bus.id}</strong><br/>
            Direction: ${bus.direction}<br/>
            Crowd: ${bus.crowdLevel}<br/>
            Next Stop: ${bus.nextStop}<br/>
            ETA: ${bus.eta}
          </div>
        `)
        .addTo(state.map);

      state.busMarkers.set(bus.id, marker);
    }
  });
}

// Switch view
function switchView(view) {
  state.view = view;
  state.showMenu = false;

  // Update active buttons
  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${view}"]`).classList.add('active');

  // Update visible view
  document.querySelectorAll('.view-container').forEach((container) => {
    container.classList.remove('active');
  });
  document.getElementById(`${view}View`).classList.add('active');

  // Close menu
  document.getElementById('menuOverlay').classList.remove('active');

  // Initialize map if needed
  if (view === 'map') {
    setTimeout(() => {
      if (state.map) {
        state.map.invalidateSize();
      } else {
        initMap();
      }
    }, 100);
  }
}

// Toggle menu
function toggleMenu() {
  state.showMenu = !state.showMenu;
  const overlay = document.getElementById('menuOverlay');
  if (state.showMenu) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

// Close menu
function closeMenu() {
  state.showMenu = false;
  document.getElementById('menuOverlay').classList.remove('active');
}

// Handle menu item click
function handleMenuClick(section) {
  closeMenu();
  
  if (section === 'routes' || section === 'schedule') {
    switchView('list');
    
    // Scroll to appropriate section
    setTimeout(() => {
      if (section === 'routes') {
        document.querySelector('.route-selector').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else if (section === 'schedule') {
        document.querySelector('.buses-header').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  }
}

// Swap route
function swapRoute() {
  const fromInputs = document.querySelectorAll('[id^="fromInput"]');
  const toInputs = document.querySelectorAll('[id^="toInput"]');

  fromInputs.forEach((input) => {
    const temp = input.value;
    input.value = document.querySelector('[id^="toInput"]').value;
    document.querySelector('[id^="toInput"]').value = temp;
  });
}

// Render buses list
function renderBusesList() {
  const container = document.getElementById('busesList');
  container.innerHTML = '';

  buses.forEach((bus) => {
    const crowdColor = bus.crowdLevel.toLowerCase();
    const busItem = document.createElement('div');
    busItem.className = 'bus-item';
    busItem.innerHTML = `
      <div class="bus-item-header">
        <div class="bus-item-left">
          <div class="bus-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 18 9.2 18 8c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 1.2-.7 2.6-1.5 2.1C2.7 10.3 2 11.1 2 12v3c0 .6.4 1 1 1h2m6-10V7m6 0v3m1 5H7"></path>
            </svg>
          </div>
          <div class="bus-info">
            <div class="bus-id">${bus.id}</div>
            <div class="bus-direction">${bus.direction}</div>
          </div>
        </div>
        <div class="bus-crowd-badge ${crowdColor}">
          <div class="bus-crowd-dot" style="background-color: ${getCrowdColor(bus.crowdLevel)};"></div>
          ${bus.crowdLevel}
        </div>
      </div>
      <div class="bus-item-details">
        <div class="bus-detail">
          <svg class="bus-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div>
            <span class="bus-detail-label">Next Stop</span>
            <span class="bus-detail-value">${bus.nextStop}</span>
          </div>
        </div>
        <div class="bus-detail">
          <svg class="bus-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div>
            <span class="bus-detail-label">ETA</span>
            <span class="bus-detail-value">${bus.eta}</span>
          </div>
        </div>
        <div class="bus-detail">
          <svg class="bus-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <div>
            <span class="bus-detail-label">Passengers</span>
            <span class="bus-detail-value">${bus.passengers}/${bus.capacity}</span>
          </div>
        </div>
        <div class="bus-detail">
          <svg class="bus-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <div>
            <span class="bus-detail-label">Status</span>
            <span class="bus-detail-value">Running</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(busItem);
  });
}

// Initialize app
function init() {
  // View switching
  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.getAttribute('data-view');
      switchView(view);
    });
  });

  // Menu
  document.getElementById('menuToggle').addEventListener('click', toggleMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  document.getElementById('menuOverlay').addEventListener('click', closeMenu);
  document.querySelector('.menu-panel').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Menu items
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      const section = e.currentTarget.getAttribute('data-section');
      handleMenuClick(section);
    });
  });

  // Route swap buttons
  const swapBtns = document.querySelectorAll('[id^="swapBtn"]');
  swapBtns.forEach((btn) => {
    btn.addEventListener('click', swapRoute);
  });

  // Render buses list
  renderBusesList();

  // Initialize map after a brief delay
  setTimeout(() => {
    initMap();
  }, 100);

  // Handle resize
  window.addEventListener('resize', () => {
    if (state.map) {
      state.map.invalidateSize();
    }
  });
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
