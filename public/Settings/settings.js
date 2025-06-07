// public/settings/js/settings.js

;(async function(){
  const controls = Array.from(document.querySelectorAll('.container .card'));
  // flatten all <input>, <select> & steppers into map by data-key
  const map = new Map();

  // helper to turn label text into a key path, e.g.
  // "Floor Temp Target Day" → "core.floorTempTargetDay"
  function slugify(str) {
    return str
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim()
      .split(/\s+/)
      .map((w,i) => i? w[0].toUpperCase()+w.slice(1) : w.toLowerCase())
      .join('');
  }

  // walk every control
  controls.forEach(card => {
    Array.from(card.querySelectorAll('label')).forEach(label => {
      const name    = slugify(label.textContent);
      const ctl     = label.nextElementSibling;
      const keyPath = label.closest('.card').querySelector('h2').textContent
                      .toLowerCase().replace(/ +/g,'') + '.' + name;
      if (ctl.matches('.stepper')) {
        const input = ctl.querySelector('input');
        map.set(keyPath, input);
        // hook up inc/dec
        ctl.querySelectorAll('button').forEach(btn => {
          btn.onclick = () => {
            let v = parseFloat(input.value)||0;
            v += btn.dataset.action==='inc'? 1:-1;
            input.value = Math.min(
              input.max||v, Math.max(input.min||v, v)
            );
          };
        });
      } else {
        map.set(keyPath, ctl);
      }
    });
  });

  async function load() {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    for (const [key, el] of map.entries()) {
      const parts = key.split('.');
      let v = parts.reduce((o,k) => (o||{})[k], cfg);
      if (el.tagName==='SELECT') {
        el.value = v;
      } else if (el.type==='time' || el.type==='date' || el.type==='text' || el.type==='password' || el.tagName==='INPUT') {
        el.value = (v!=null? v:'');
      }
    }
  }

  async function save() {
    document.getElementById('status')?.remove();
    const status = document.createElement('pre');
    status.id = 'status';
    status.textContent = 'Saving…';
    document.body.appendChild(status);

    try {
      for (const [key, el] of map.entries()) {
        let value = el.value;
        // cast numbers & booleans
        if (el.type==='number')       value = +value;
        else if (value==='true'||value==='false') value = value==='true';
        await fetch('/api/config/set', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ key, value })
        });
      }
      status.textContent = '✔️ Saved successfully';
    } catch (err) {
      status.textContent = '❌ Save failed: ' + err;
    }
  }

  document.querySelector('.btn-primary').onclick = save;
  await load();
})();
