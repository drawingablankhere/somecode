// Fetch current config and populate fields
async function loadConfig() {
  const res = await fetch('/api/config');
  const config = await res.json();
  document.querySelectorAll('input[data-key]').forEach(input => {
    const key = input.dataset.key;
    if (config[key] !== undefined) input.value = config[key];
  });
}

// Save updated config back to server
async function saveConfig() {
  // build a flat object of only the fields we have
  const newConfig = {};
  document.querySelectorAll('input[data-key]').forEach(input => {
    const key = input.dataset.key;
    newConfig[key] = parseFloat(input.value);
  });

  const res = await fetch('/api/config', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(newConfig)
  });

  if (res.ok) alert('Settings saved!');
  else alert('Error saving settings');
}

// Attach stepper buttons
document.querySelectorAll('.stepper').forEach(container => {
  const dec = container.querySelector('button[data-action="dec"]');
  const inc = container.querySelector('button[data-action="inc"]');
  const input = container.querySelector('input');

  dec.addEventListener('click', () => {
    input.stepDown();
  });
  inc.addEventListener('click', () => {
    input.stepUp();
  });
});

// Wire up Save button
document.getElementById('saveBtn').addEventListener('click', saveConfig);

// On load
window.addEventListener('DOMContentLoaded', loadConfig);
