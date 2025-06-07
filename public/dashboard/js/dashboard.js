// ----- default section mapping -----
const DEFAULT_LAYOUT = {
  floor:   ['floor_1','floor_2'],
  room:    ['room_1','room_2','room_3','room_4','room_5','room_6','room_7','room_8'],
  outside:['intake_temp','outside_temp','co2_1','co2_2']
};

// load or fall back
function loadLayout() {
  try {
    return JSON.parse(localStorage.getItem('sensorLayout')) || DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}
function saveLayout(layout) {
  localStorage.setItem('sensorLayout', JSON.stringify(layout));
}

// ----- DOM refs -----
const grids = {
  floor:   document.getElementById('floor-grid'),
  room:    document.getElementById('room-grid'),
  outside: document.getElementById('outside-grid')
};

const layout = loadLayout();

// ----- render sensors -----
async function fetchAndRender() {
  // clear
  Object.values(grids).forEach(g=>g.innerHTML='');

  const res = await fetch('/api/status/sensors');
  const { sensors } = await res.json();  // expects { sensors: { id: { value, status, ... } } }

  // for each section
  for (let [section, ids] of Object.entries(layout)) {
    ids.forEach(id => {
      const stats = sensors[id];
      if (!stats) return;
      // determine tile class
      let cls = 'ok';
      if (stats.status === 'fault')         cls='alert';
      else if ((stats.errorRate||0) > 0.2)  cls='warn';

      // build tile
      const div = document.createElement('div');
      div.className = `sensor-tile ${cls}`;
      div.innerHTML = `
        <h4>${id.replace('_',' ').toUpperCase()}</h4>
        <p>${stats.value.temperature?.toFixed(1)}°C / ${stats.value.humidity?.toFixed(0)}%</p>
      `;
      grids[section].append(div);
    });
  }
}

// ----- build chart -----
let historyChart;
async function fetchHistory() {
  const res = await fetch('/api/status/history?timeRange=1h');
  return res.json(); // expects array of { timestamp, readings: [...] }
}
async function renderChart() {
  const data = await fetchHistory();
  const times = data.map(d=>new Date(d.timestamp).toLocaleTimeString());
  const temps = data.map(d=>{
    const avg = d.readings.reduce((sum,r)=>sum+r.temperature,0)/d.readings.length;
    return avg.toFixed(1);
  });
  const hums = data.map(d=>{
    const avg = d.readings.reduce((sum,r)=>sum+r.humidity,0)/d.readings.length;
    return avg.toFixed(0);
  });

  const ctx = document.getElementById('historyChart').getContext('2d');
  if (historyChart) historyChart.destroy();
  historyChart = new Chart(ctx, {
    type:'line',
    data:{
      labels: times,
      datasets:[
        { label:'Temp (°C)', data:temps, fill:false, tension:0.3 },
        { label:'Humidity (%)', data:hums, fill:false, tension:0.3 }
      ]
    },
    options:{
      scales:{
        y:{ beginAtZero:false }
      },
      plugins:{
        legend:{ position:'bottom' }
      }
    }
  });
}

// ----- polling -----
fetchAndRender();
renderChart();
setInterval(fetchAndRender, 30_000);
setInterval(renderChart,   60_000);

// ----- layout config modal -----
const modal   = document.getElementById('config-modal');
const form    = document.getElementById('mapping-form');
const btnOpen = document.getElementById('btn-config');
const btnSave = document.getElementById('save-mapping');
const btnCancel = document.getElementById('cancel-mapping');

btnOpen.addEventListener('click', () => {
  // rebuild form
  form.innerHTML='';
  // gather all sensor IDs seen so far
  const allIds = new Set([].concat(...Object.values(layout)));
  allIds.forEach(id => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>${id}</label>
      <select name="${id}">
        <option value="floor">Floor</option>
        <option value="room">Room</option>
        <option value="outside">Outside</option>
      </select>
    `;
    form.append(div);
    form.querySelector(`[name="${id}"]`).value = (
      layout.floor.includes(id)? 'floor'
    : layout.room.includes(id)?  'room'
    : 'outside');
  });
  modal.classList.remove('hidden');
});

btnCancel.addEventListener('click',()=> modal.classList.add('hidden'));

btnSave.addEventListener('click',()=>{
  // rebuild layout from form
  const newLayout = { floor:[], room:[], outside:[] };
  new FormData(form).forEach((section,id)=>{
    newLayout[section].push(id);
  });
  saveLayout(newLayout);
  Object.assign(layout,newLayout);
  modal.classList.add('hidden');
  fetchAndRender();
});
