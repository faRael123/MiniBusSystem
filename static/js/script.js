/* ================= PAGE SWITCH ================= */

let mapInitialized = false;
let map;
let busMarkers = []; // store markers for camera tracking

function showPage(page, el) {

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('hidden');
  });

  // Show selected page
  document.getElementById(page).classList.remove('hidden');

  // Active button
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.classList.remove('active');
  });

  if (el) el.classList.add('active');

  // Initialize map only once
  if (page === 'live' && !mapInitialized) {
    initMap();
    mapInitialized = true;
  }

  // Fix map size when switching
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 300);
}


/* ================= CHART HELPER ================= */

function createChart(id, config) {
  const el = document.getElementById(id);
  if (!el) return null;
  return new Chart(el, config);
}


/* ================= DASHBOARD CHARTS ================= */

// Weekly Passengers
createChart('lineChart', {
  type: 'line',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Passengers',
      data: [980,1100,1050,1200,1280,900,750],
      borderColor: '#3b82f6',
      tension: 0.4
    }]
  }
});

// Occupancy
createChart('barChart', {
  type: 'bar',
  data: {
    labels: ['6AM','9AM','12PM','3PM','6PM'],
    datasets: [{
      label: 'Occupancy %',
      data: [55,90,70,100,85],
      backgroundColor: '#3b82f6'
    }]
  }
});


/* ================= CROWD ANALYTICS ================= */

// Passenger Flow
createChart('overviewChart', {
  type: 'line',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Passengers',
      data: [1000,1200,1100,1300,1400,950,800],
      borderColor: '#3b82f6',
      tension: 0.4
    }]
  }
});

// Peak Hours
createChart('peakChart', {
  type: 'bar',
  data: {
    labels: ['6AM','9AM','12PM','3PM','6PM','9PM'],
    datasets: [{
      label: 'Passengers',
      data: [120,320,260,420,520,210],
      backgroundColor: '#6366f1'
    }]
  }
});

// Demographics
createChart('demoChart', {
  type: 'pie',
  data: {
    labels: ['Students','Workers','Others'],
    datasets: [{
      data: [45,40,15],
      backgroundColor: ['#3b82f6','#22c55e','#f59e0b']
    }]
  }
});

// Passenger Type
createChart('typeChart', {
  type: 'doughnut',
  data: {
    labels: ['Regular','Senior','PWD'],
    datasets: [{
      data: [65,20,15],
      backgroundColor: ['#6366f1','#f43f5e','#10b981']
    }]
  }
});

// Destinations
createChart('destinationChart', {
  type: 'bar',
  data: {
    labels: ['Cabanatuan','Cabiao','Gapan','San Jose'],
    datasets: [{
      label: 'Passengers',
      data: [340,290,220,160],
      backgroundColor: '#3b82f6'
    }]
  }
});


/* ================= MAP ================= */

function initMap() {
  map = L.map('map').setView([15.486, 120.597], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Multiple buses (markers)
  const buses = [
    { name: "MB-01", coords: [15.486, 120.597] },
    { name: "MB-02", coords: [15.49, 120.60] },
    { name: "MB-03", coords: [15.48, 120.59] }
  ];

  buses.forEach(bus => {
    const marker = L.marker(bus.coords)
      .addTo(map)
      .bindPopup(bus.name);
    busMarkers.push(marker);
  });
}


/* ================= LOGOUT ================= */

function confirmLogout() {
  if (confirm('Are you sure you want to logout? Any unsaved changes will be lost.')) {
    console.log('User confirmed logout');
    return true; // Allow navigation to /logout
  }
  return false; // Prevent navigation
}


/* ================= CAMERA CONTROL ================= */

let currentBusId = null;
let currentBusName = null;
let currentBusRoute = null;
let cameraStatus = false;
let panTiltPosition = { x: 0, y: 0 };
let zoomLevel = 1;

// Open camera modal
function openCameraPanel() {
  const modal = document.getElementById('cameraModal');
  modal.classList.remove('hidden');
  cameraStatus = true;
  const statusEl = document.getElementById('cameraStatus');
  statusEl.textContent = 'ON';
  statusEl.classList.add('on');
  document.getElementById('cameraScreen').textContent = currentBusName ? '🟢 Live Feed: ' + currentBusName : '🟢 Live Feed: None';
  showSingleCamera();
}

// Close camera modal
function closeCameraPanel() {
  const modal = document.getElementById('cameraModal');
  modal.classList.add('hidden');
}

function viewAllCameras() {
  document.getElementById('allCameraGrid').classList.remove('hidden');
  document.getElementById('cameraFeed').style.display = 'none';
  document.getElementById('singleCameraBtn').classList.remove('active');
  document.getElementById('allCameraBtn').classList.add('active');
}

function showSingleCamera() {
  document.getElementById('allCameraGrid').classList.add('hidden');
  document.getElementById('cameraFeed').style.display = 'block';
  document.getElementById('singleCameraBtn').classList.add('active');
  document.getElementById('allCameraBtn').classList.remove('active');
}

// Select a bus and update display
function selectBus(busId, busName, busRoute) {
  currentBusId = busId;
  currentBusName = busName;
  currentBusRoute = busRoute;
  cameraStatus = true;
  panTiltPosition = { x: 0, y: 0 };
  zoomLevel = 1;

  // Update selected bus info
  document.getElementById('selectedBusName').textContent = busName;
  document.getElementById('selectedBusRoute').textContent = busRoute;
  document.getElementById('cameraScreen').textContent = '🟢 Live Feed: ' + busName;
  const statusEl = document.getElementById('cameraStatus');
  statusEl.textContent = 'ON';
  statusEl.classList.add('on');

  showSingleCamera();

  // Update button states
  document.querySelectorAll('.bus-select-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Find and select the correct button
  document.querySelectorAll('.bus-select-btn').forEach(btn => {
    if (btn.textContent.includes(busName)) {
      btn.classList.add('selected');
    }
  });

  console.log('Selected bus: ' + busName + ' - ' + busRoute);
}

// Select bus from fleet list and open camera
function selectBusAndOpenCamera(busId, busName, busRoute) {
  selectBus(busId, busName, busRoute);
  openCameraPanel();
}

// Camera ON
function cameraOn() {
  if (!currentBusId) {
    alert('Please select a bus first');
    return;
  }
  cameraStatus = true;
  document.getElementById('cameraStatus').textContent = 'ON';
  document.getElementById('cameraStatus').classList.add('on');
  document.getElementById('cameraScreen').textContent = '🟢 Live Feed: ' + currentBusName;
  console.log('Camera ON for bus ' + currentBusName);
}

// Camera OFF
function cameraOff() {
  cameraStatus = false;
  document.getElementById('cameraStatus').textContent = 'OFF';
  document.getElementById('cameraStatus').classList.remove('on');
  document.getElementById('cameraScreen').textContent = currentBusName + ' - ' + currentBusRoute + ' Route';
  console.log('Camera OFF for bus ' + currentBusName);
}

// Pan camera
function pan(direction) {
  if (!cameraStatus) {
    alert('Turn camera ON first');
    return;
  }
  const step = 10;
  switch(direction) {
    case 'up':
      panTiltPosition.y -= step;
      console.log('Pan UP - Position: (' + panTiltPosition.x + ', ' + panTiltPosition.y + ')');
      break;
    case 'down':
      panTiltPosition.y += step;
      console.log('Pan DOWN - Position: (' + panTiltPosition.x + ', ' + panTiltPosition.y + ')');
      break;
    case 'left':
      panTiltPosition.x -= step;
      console.log('Pan LEFT - Position: (' + panTiltPosition.x + ', ' + panTiltPosition.y + ')');
      break;
    case 'right':
      panTiltPosition.x += step;
      console.log('Pan RIGHT - Position: (' + panTiltPosition.x + ', ' + panTiltPosition.y + ')');
      break;
  }
  updateCameraView();
}

// Zoom camera
function zoom(direction) {
  if (!cameraStatus) {
    alert('Turn camera ON first');
    return;
  }
  if (direction === 'in') {
    zoomLevel = Math.min(zoomLevel + 0.2, 3);
    console.log('Zoom IN - Level: ' + zoomLevel.toFixed(1) + 'x');
  } else if (direction === 'out') {
    zoomLevel = Math.max(zoomLevel - 0.2, 1);
    console.log('Zoom OUT - Level: ' + zoomLevel.toFixed(1) + 'x');
  }
  updateCameraView();
}

// Update camera view
function updateCameraView() {
  const screen = document.getElementById('cameraScreen');
  if (cameraStatus) {
    screen.style.transform = 'translate(' + panTiltPosition.x + 'px, ' + panTiltPosition.y + 'px) scale(' + zoomLevel + ')';
    screen.textContent = '🟢 Zoom: ' + zoomLevel.toFixed(1) + 'x | Pan: (' + panTiltPosition.x + ', ' + panTiltPosition.y + ')';
  }
}

// Reset camera
function resetCamera() {
  panTiltPosition = { x: 0, y: 0 };
  zoomLevel = 1;
  updateCameraView();
  console.log('Camera reset to default position and zoom (100%)');
  
  if (cameraStatus) {
    document.getElementById('cameraScreen').textContent = '🟢 Live Feed: ' + currentBusName + ' (Reset)';
  }
}


/* ================= AUTO UPDATE (SIMULATION) ================= */

// Simulate real-time updates
setInterval(() => {

  // Randomize dashboard numbers (optional realism)
  const randomPassengers = Math.floor(Math.random() * 200) + 1000;

  console.log("Updated passengers:", randomPassengers);

  // Example: simulate bus movement on map if camera is ON
  if (cameraStatus && busMarkers.length > 0) {
    busMarkers.forEach(marker => {
      const latOffset = (Math.random() - 0.5) * 0.001;
      const lngOffset = (Math.random() - 0.5) * 0.001;
      const latlng = marker.getLatLng();
      marker.setLatLng([latlng.lat + latOffset, latlng.lng + lngOffset]);
    });
  }

}, 5000);
