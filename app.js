// ══════════════════════════════════
// MODE SWITCHER
// ══════════════════════════════════
let currentMode = 'portfolio';

function switchMode() {
  const toMode = currentMode === 'portfolio' ? 'xploit' : 'portfolio';
  const fromEl = document.getElementById('app-' + currentMode);
  const toEl   = document.getElementById('app-' + toMode);

  document.getElementById('ms-portfolio').classList.toggle('active', toMode === 'portfolio');
  document.getElementById('ms-xploit').classList.toggle('active', toMode === 'xploit');

  fromEl.classList.remove('visible');
  setTimeout(() => {
    fromEl.classList.remove('shown');
    toEl.classList.add('shown');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toEl.classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (toMode === 'portfolio') triggerSkillBars();
      });
    });
  }, 280);

  currentMode = toMode;
}

// Init: show portfolio with fade-in after boot
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('app-portfolio').classList.add('visible');
  }, 3100);
});

// ══════════════════════════════════
// PORTFOLIO JS
// ══════════════════════════════════

// Reveal observer
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => obs.observe(r));

// Skill bars
function triggerSkillBars() {
  document.querySelectorAll('.skill-block').forEach(b => {
    const w = b.getAttribute('data-w');
    if (w) {
      const bar = b.querySelector('.skill-bar');
      if (bar) { bar.style.width = '0'; setTimeout(() => { bar.style.width = w + '%'; }, 150); }
    }
  });
}

const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.skill-block').forEach(b => {
        const w = b.getAttribute('data-w');
        const bar = b.querySelector('.skill-bar');
        if (bar && w) { bar.style.width = '0'; setTimeout(() => { bar.style.width = w + '%'; }, 100); }
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
const skillsSection = document.querySelector('#skills');
if (skillsSection) skillObs.observe(skillsSection);

function toggleMission(card) {
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.mission-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}

// ══════════════════════════════════
// XPLOIT STATE
// ══════════════════════════════════
const G = {
  live: false, apiUrl: 'http://localhost:5000',
  scans: [], vulns: [], ports: [],
  ctfScore: 0, ctfFlags: 0, ctfSolved: new Set(),
  activeCh: 0, ctfLastScan: null, scanning: false
};

const CH = [
  {
    name: 'TARGET-ALPHA', target: '10.0.0.47', pts: 100,
    flag: 'XPLOIT{4lph4_4dm1n_p4n3l_xp05ed}',
    hint: 'PORT 8080 IS ACTIVE. APACHE TOMCAT DEFAULT MANAGER IS OFTEN EXPOSED WITH DEFAULT CREDENTIALS.',
    sim: {
      ports: [
        { port: 22,   state: 'open',   service: 'SSH',      version: 'OpenSSH 7.2p2' },
        { port: 80,   state: 'open',   service: 'HTTP',     version: 'Apache 2.4.18' },
        { port: 443,  state: 'open',   service: 'HTTPS',    version: 'Apache 2.4.18' },
        { port: 8080, state: 'open',   service: 'HTTP-ALT', version: 'Apache Tomcat 6.0.18' },
        { port: 3306, state: 'open',   service: 'MySQL',    version: 'MySQL 5.5.47' },
        { port: 21,   state: 'closed', service: 'FTP',      version: '' },
        { port: 8443, state: 'closed', service: 'HTTPS-ALT',version: '' }
      ],
      vulns: [
        { name: 'Apache Tomcat RCE',      sev: 'CRITICAL', cve: 'CVE-2017-12617', desc: 'PUT method enabled on Tomcat 6.x -- unrestricted file upload leads to RCE.' },
        { name: 'MySQL Default Credentials', sev: 'HIGH',  cve: 'CVE-2012-2122', desc: 'MySQL root accessible without password on port 3306.' },
        { name: 'Apache Outdated Version',sev: 'MEDIUM',   cve: 'CVE-2016-0736', desc: 'Apache 2.4.18 information disclosure vulnerability.' },
        { name: 'SSH Weak Cipher',         sev: 'LOW',     cve: 'N/A',           desc: 'arcfour cipher enabled in SSH daemon configuration.' }
      ],
      os: 'Linux 3.16 (Ubuntu 16.04)',
      intel: 'NAVIGATE TO PORT 8080/MANAGER/HTML -- TOMCAT MANAGER EXPOSED WITH DEFAULT CREDS tomcat:tomcat'
    }
  },
  {
    name: 'SHADOW-NODE', target: '10.0.0.88', pts: 250,
    flag: 'XPLOIT{5h4d0w_ssh_priv_k3y_l34k}',
    hint: 'REDIS RUNNING WITHOUT AUTH. USE CONFIG SET DIR + DBFILENAME TO WRITE SSH KEY TO /ROOT/.SSH/AUTHORIZED_KEYS.',
    sim: {
      ports: [
        { port: 22,    state: 'open', service: 'SSH',           version: 'OpenSSH 8.0' },
        { port: 80,    state: 'open', service: 'HTTP',          version: 'nginx 1.14.0' },
        { port: 3000,  state: 'open', service: 'Node.js',       version: 'Express 4.17' },
        { port: 9200,  state: 'open', service: 'Elasticsearch', version: '6.8.0' },
        { port: 27017, state: 'open', service: 'MongoDB',       version: '4.0.3' },
        { port: 6379,  state: 'open', service: 'Redis',         version: '5.0.3' },
        { port: 11211, state: 'open', service: 'Memcached',     version: '1.5.6' }
      ],
      vulns: [
        { name: 'Elasticsearch No Auth',  sev: 'CRITICAL', cve: 'CVE-2014-3120',  desc: 'Elasticsearch 6.8.0 fully accessible without authentication.' },
        { name: 'MongoDB No Auth',        sev: 'CRITICAL', cve: 'CVE-2013-4650',  desc: 'MongoDB listening on public interface without requireAuth.' },
        { name: 'Redis Unprotected',      sev: 'HIGH',     cve: 'CVE-2015-4335',  desc: 'Redis running without requirepass -- arbitrary write to filesystem.' },
        { name: 'Memcached Amplification',sev: 'MEDIUM',   cve: 'CVE-2018-1000115',desc: 'UDP reflection DDoS amplification vector on port 11211.' }
      ],
      os: 'Linux 4.19 (Debian 10)',
      intel: 'REDIS CONFIG SET dir /root/.ssh && DBFILENAME authorized_keys && SET x [pubkey] && BGSAVE'
    }
  },
  {
    name: 'GHOST-WEB', target: '10.0.0.132', pts: 500,
    flag: 'XPLOIT{gh05t_xss_s3ss10n_h1j4ck3d}',
    hint: 'THE ?SEARCH= PARAMETER REFLECTS UNSANITIZED INPUT. CRAFT AN XSS PAYLOAD TO EXFILTRATE THE ADMIN SESSION COOKIE.',
    sim: {
      ports: [
        { port: 80,   state: 'open',   service: 'HTTP',       version: 'nginx 1.18.0' },
        { port: 443,  state: 'open',   service: 'HTTPS',      version: 'nginx 1.18.0 + TLS 1.2' },
        { port: 8443, state: 'open',   service: 'Admin Panel', version: 'PHP 7.2.24' },
        { port: 5432, state: 'open',   service: 'PostgreSQL', version: '12.3' },
        { port: 25,   state: 'open',   service: 'SMTP',       version: 'Postfix 3.4.13' },
        { port: 110,  state: 'closed', service: 'POP3',       version: '' },
        { port: 143,  state: 'closed', service: 'IMAP',       version: '' }
      ],
      vulns: [
        { name: 'Reflected XSS',     sev: 'CRITICAL', cve: 'CWE-79',  desc: '?search= parameter reflects unescaped input -- full session hijack possible.' },
        { name: 'SQL Injection',     sev: 'CRITICAL', cve: 'CWE-89',  desc: 'Product ID parameter vulnerable to UNION-based SQL injection.' },
        { name: 'CSRF Token Missing',sev: 'HIGH',     cve: 'CWE-352', desc: 'No CSRF token on checkout and profile update forms.' },
        { name: 'TLS 1.0 Active',    sev: 'MEDIUM',   cve: 'CVE-2011-3389', desc: 'Legacy TLS 1.0 enabled -- BEAST attack vector present.' }
      ],
      os: 'Linux 5.4 (Ubuntu 20.04)',
      intel: 'INJECT XSS IN SEARCH FIELD: document.location POINTING TO ATTACKER SERVER WITH document.cookie APPENDED'
    }
  }
];

// ── XPLOIT NAV ──
function xnav(id, el) {
  document.querySelectorAll('.xview').forEach(v => v.classList.remove('active'));
  document.getElementById('xview-' + id).classList.add('active');
  document.querySelectorAll('#app-xploit .nav-link').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
}

function toggleApi() {
  G.live = !G.live;
  document.getElementById('api-tog').classList.toggle('on', G.live);
  document.getElementById('api-dot').classList.toggle('live', G.live);
  document.getElementById('api-lbl').textContent = G.live ? 'LIVE API' : 'SIM MODE';
  notif(G.live ? '// LIVE API ENABLED' : '// SIMULATION MODE ACTIVE', G.live ? 'warn' : '');
}

function quickScan() {
  const t = document.getElementById('dash-url').value.trim();
  if (!t) { notif('// ENTER A TARGET', 'err'); return; }
  document.getElementById('scan-url').value = t;
  xnav('scanner', document.querySelectorAll('#app-xploit .nav-link')[1]);
  setTimeout(runScan, 80);
}

async function runScan() {
  if (G.scanning) return;
  const tgt = document.getElementById('scan-url').value.trim();
  if (!tgt) { notif('// ENTER A TARGET', 'err'); return; }
  G.scanning = true;
  const btn = document.getElementById('scan-btn');
  btn.disabled = true; btn.textContent = 'SCANNING...';
  clearT('scan-out');
  tlog('scan-out', `// TARGET: ${tgt}`, 'ok');
  tlog('scan-out', `// MODE: ${G.live ? 'LIVE API' : 'SIMULATION'}`, 'info');
  showProg(true);
  const opts = {
    ports: document.getElementById('sc-ports').checked,
    vulns: document.getElementById('sc-vulns').checked,
    os:    document.getElementById('sc-os').checked
  };
  G.live ? await liveScan(tgt, opts) : await simScan(tgt, opts);
  btn.disabled = false; btn.textContent = 'LAUNCH SCAN';
  G.scanning = false; showProg(false); refreshStats();
}

async function simScan(tgt, opts) {
  const ds = CH[Math.floor(Math.random() * CH.length)].sim;
  await setStep('ps-init'); tlog('scan-out', `// Resolving ${tgt}...`, 'info'); await sl(500);
  tlog('scan-out', `// Host UP -- ${(Math.random() * 4 + 0.5).toFixed(1)}ms latency`, 'ok');
  await setStep('ps-recon'); tlog('scan-out', '// Starting recon...', 'info'); await sl(400);
  if (opts.os) tlog('scan-out', `// OS Guess: ${ds.os}`, 'warn');
  if (opts.ports) {
    await setStep('ps-ports'); tlog('scan-out', '', ''); tlog('scan-out', '// ---- PORT SCAN ----', 'ok'); await progAnim(0, 55, 2200);
    for (const p of ds.ports) { await sl(70); tlog('scan-out', `  ${p.state === 'open' ? '[OPEN]' : '[----]'} ${String(p.port).padEnd(6)} ${p.service.padEnd(16)} ${p.version}`, p.state === 'open' ? 'data' : 'port'); }
    renderSidePorts(ds.ports); G.ports.push(...ds.ports.filter(p => p.state === 'open')); updatePortView(ds.ports, ds.os);
  }
  if (opts.vulns) {
    await setStep('ps-vulns'); tlog('scan-out', '', ''); tlog('scan-out', '// ---- VULNERABILITY ASSESSMENT ----', 'ok'); await progAnim(55, 95, 2500);
    for (const v of ds.vulns) { await sl(100); tlog('scan-out', `  [${v.sev}] ${v.name} (${v.cve})`, v.sev === 'CRITICAL' ? 'hi' : v.sev === 'HIGH' ? 'err' : 'warn'); }
    renderSideVulns(ds.vulns); G.vulns.push(...ds.vulns.map(v => ({ ...v, target: tgt }))); renderVulnList('all');
  }
  await setStep('ps-report'); await progAnim(95, 100, 300);
  tlog('scan-out', '', ''); tlog('scan-out', '// Scan complete.', 'ok');
  G.scans.push({ target: tgt, time: new Date(), vulns: ds.vulns, ports: ds.ports });
  renderRecent(); renderDb();
  notif(`// SCAN COMPLETE -- ${ds.vulns.length} VULNERABILITIES FOUND`, 'ok');
}

async function liveScan(tgt, opts) {
  tlog('scan-out', `// Connecting to API...`, 'info');
  try {
    const r = await fetch(`${G.apiUrl}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: tgt, options: opts })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    if (d.ports) { tlog('scan-out', '// PORT RESULTS', 'ok'); d.ports.forEach(p => tlog('scan-out', `  [${p.state.toUpperCase()}] ${p.port} ${p.service}`, p.state === 'open' ? 'data' : 'port')); renderSidePorts(d.ports); G.ports.push(...d.ports.filter(p => p.state === 'open')); }
    if (d.vulns) { tlog('scan-out', '// VULNERABILITIES', 'ok'); d.vulns.forEach(v => tlog('scan-out', `  [${v.sev}] ${v.name}`, 'hi')); renderSideVulns(d.vulns); G.vulns.push(...d.vulns.map(v => ({ ...v, target: tgt }))); renderVulnList('all'); }
    G.scans.push({ target: tgt, time: new Date(), vulns: d.vulns || [], ports: d.ports || [] });
    renderRecent(); renderDb(); notif('// LIVE SCAN COMPLETE', 'ok');
  } catch (e) {
    tlog('scan-out', `// API ERROR: ${e.message}`, 'hi');
    tlog('scan-out', '// Falling back to simulation...', 'info');
    await simScan(tgt, opts);
  }
}

function selCh(idx) {
  G.activeCh = idx;
  document.querySelectorAll('.ch-item').forEach((c, i) => c.classList.toggle('active', i === idx));
  const ch = CH[idx];
  document.getElementById('ctf-tgt').textContent = ch.target;
  document.getElementById('ctf-hint').textContent = ch.hint;
  tlog('ctf-out', `// CHALLENGE: ${ch.name} | TARGET: ${ch.target} | ${ch.pts} PTS`, 'ok');
}

async function launchCtf() {
  if (G.scanning) return;
  G.scanning = true;
  const btn = document.getElementById('ctf-launch');
  btn.disabled = true; btn.textContent = 'SCANNING...';
  const ch = CH[G.activeCh];
  tlog('ctf-out', '', ''); tlog('ctf-out', `// XPLOIT TARGETING ${ch.target}`, 'ok'); await sl(350);
  if (G.live) {
    try {
      const r = await fetch(`${G.apiUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: ch.target, options: { ports: true, vulns: true } })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if (d.ports) d.ports.forEach(p => tlog('ctf-out', `  [${p.state.toUpperCase()}] ${p.port} ${p.service}`, p.state === 'open' ? 'data' : 'port'));
      if (d.vulns) d.vulns.forEach(v => tlog('ctf-out', `  [${v.sev}] ${v.name}`, 'hi'));
      G.ctfLastScan = d;
    } catch (e) { tlog('ctf-out', `// API ERROR -- falling back`, 'hi'); await ctfSim(ch); }
  } else { await ctfSim(ch); }
  document.getElementById('ctf-vulns').textContent = ch.sim.vulns.length;
  btn.disabled = false; btn.textContent = 'LAUNCH XPLOIT'; G.scanning = false;
}

async function ctfSim(ch) {
  G.ctfLastScan = ch.sim;
  tlog('ctf-out', `// HOST UP -- ${ch.target}`, 'ok'); await sl(300);
  tlog('ctf-out', '', ''); tlog('ctf-out', '// ---- PORT SCAN ----', 'ok'); await sl(600);
  for (const p of ch.sim.ports) { await sl(65); tlog('ctf-out', `  ${p.state === 'open' ? '[OPEN]' : '[----]'} ${String(p.port).padEnd(6)} ${p.service.padEnd(14)} ${p.version}`, p.state === 'open' ? 'data' : 'port'); }
  tlog('ctf-out', '', ''); tlog('ctf-out', '// ---- VULNERABILITY ASSESSMENT ----', 'ok'); await sl(700);
  for (const v of ch.sim.vulns) { await sl(90); tlog('ctf-out', `  [${v.sev}] ${v.name} (${v.cve})`, v.sev === 'CRITICAL' ? 'hi' : v.sev === 'HIGH' ? 'err' : 'warn'); }
  tlog('ctf-out', '', ''); tlog('ctf-out', `// INTEL: ${ch.sim.intel}`, 'warn');
  tlog('ctf-out', '// Submit the flag below when ready.', 'info');
}

function subFlag() {
  const inp = document.getElementById('flag-inp');
  const flag = inp.value.trim(); const ch = CH[G.activeCh];
  if (!flag) return;
  tlog('ctf-out', `// SUBMITTING: ${flag}`, 'info');
  if (flag === ch.flag) {
    if (G.ctfSolved.has(G.activeCh)) { tlog('ctf-out', '// Already solved.', 'warn'); return; }
    G.ctfSolved.add(G.activeCh); G.ctfScore += ch.pts; G.ctfFlags++;
    tlog('ctf-out', '', ''); tlog('ctf-out', '// *** FLAG ACCEPTED ***', 'ok');
    tlog('ctf-out', `// +${ch.pts} PTS AWARDED -- TOTAL: ${G.ctfScore}`, 'ok');
    document.getElementById('ctf-score').textContent = G.ctfScore;
    document.getElementById('ctf-flags').textContent = `${G.ctfFlags}/3`;
    document.getElementById('ctf-prog').textContent = `${G.ctfFlags} / 3`;
    document.getElementById('s-ctf').textContent = G.ctfScore;
    const card = document.getElementById('ch-' + G.activeCh);
    card.classList.add('solved');
    card.querySelector('.ch-meta').innerHTML = `<span class="diff d-e">SOLVED</span><span class="ch-solved-lbl">+${ch.pts} PTS</span>`;
    scorePop(`+${ch.pts}`); notif(`// FLAG CAPTURED -- +${ch.pts} PTS`, 'ok');
    if (G.ctfFlags === 3) {
      setTimeout(() => {
        tlog('ctf-out', '', '');
        tlog('ctf-out', '// ALL FLAGS CAPTURED -- SIMULATION COMPLETE', 'ok');
        tlog('ctf-out', `// FINAL SCORE: ${G.ctfScore}/850 PTS`, 'ok');
      }, 500);
    }
  } else {
    tlog('ctf-out', '// INCORRECT FLAG. TRY AGAIN.', 'hi');
    tlog('ctf-out', `// HINT: ${ch.hint}`, 'warn');
    notif('// INCORRECT FLAG', 'err');
  }
  inp.value = '';
}

function execCtfCmd() {
  const inp = document.getElementById('ctf-cmd');
  const cmd = inp.value.trim().toLowerCase(); if (!cmd) return;
  inp.value = ''; tlog('ctf-out', `operator@xploit:~$ ${cmd}`, 'w');
  const p = cmd.split(' ');
  const cmds = {
    help:        () => ['help', 'clear', 'hint', 'score', 'vulns', 'ports', 'challenges', 'flag <value>'].forEach(c => tlog('ctf-out', '  ' + c, 'info')),
    clear:       () => clearT('ctf-out'),
    hint:        () => tlog('ctf-out', '// ' + CH[G.activeCh].hint, 'warn'),
    score:       () => tlog('ctf-out', `// SCORE: ${G.ctfScore} PTS | FLAGS: ${G.ctfFlags}/3`, 'ok'),
    vulns:       () => { if (!G.ctfLastScan) { tlog('ctf-out', '// No scan yet.', 'warn'); return; } (G.ctfLastScan.vulns || []).forEach(v => tlog('ctf-out', `  [${v.sev}] ${v.name}`, v.sev === 'CRITICAL' ? 'hi' : 'err')); },
    ports:       () => { if (!G.ctfLastScan) { tlog('ctf-out', '// No scan yet.', 'warn'); return; } (G.ctfLastScan.ports || []).forEach(pp => tlog('ctf-out', `  ${pp.port} ${pp.state} ${pp.service}`, pp.state === 'open' ? 'data' : 'port')); },
    challenges:  () => CH.forEach((c, i) => tlog('ctf-out', `  [${i}] ${c.name} (${c.pts}pts) ${G.ctfSolved.has(i) ? '[SOLVED]' : ''}`, '')),
    flag:        () => { if (p[1]) { document.getElementById('flag-inp').value = p.slice(1).join(' '); subFlag(); } else tlog('ctf-out', '// Usage: flag XPLOIT{...}', 'warn'); }
  };
  const h = cmds[p[0]]; if (h) h(); else tlog('ctf-out', `// Unknown: ${cmd}`, 'hi');
}

// ── CONSOLE HISTORY ──
const cH = []; let cHi = -1;

function consKey(e) {
  if (e.key === 'Enter') execCons();
  if (e.key === 'ArrowUp')   { cHi = Math.min(cHi + 1, cH.length - 1); if (cH[cHi]) document.getElementById('cons-inp').value = cH[cHi]; }
  if (e.key === 'ArrowDown') { cHi = Math.max(cHi - 1, -1); document.getElementById('cons-inp').value = cHi >= 0 ? cH[cHi] : ''; }
}

function execCons() {
  const inp = document.getElementById('cons-inp');
  const cmd = inp.value.trim(); if (!cmd) return;
  cH.unshift(cmd); cHi = -1; inp.value = '';
  tlog('cons-out', `operator@xploit:~$ ${cmd}`, 'ok');
  const p = cmd.toLowerCase().split(' ');
  const cmds = {
    help:        () => ['help', 'clear', 'whoami', 'score', 'status', 'challenges', 'scan <target>'].forEach(c => tlog('cons-out', '  ' + c, 'info')),
    clear:       () => clearT('cons-out'),
    whoami:      () => tlog('cons-out', '// Anubhav Rajput | XPLOIT | IILM University | New Delhi, IN', 'ok'),
    score:       () => tlog('cons-out', `// CTF: ${G.ctfScore} pts | Flags: ${G.ctfFlags}/3 | Vulns: ${G.vulns.length}`, 'ok'),
    status:      () => tlog('cons-out', `// Mode: ${G.live ? 'LIVE' : 'SIM'} | Scans: ${G.scans.length} | Vulns: ${G.vulns.length} | Ports: ${G.ports.length}`, 'ok'),
    challenges:  () => CH.forEach((c, i) => tlog('cons-out', `  [${i}] ${c.name} (${c.pts}pts) ${G.ctfSolved.has(i) ? '[SOLVED]' : ''}`, '')),
    scan:        () => { if (p[1]) { document.getElementById('scan-url').value = p[1]; xnav('scanner', document.querySelectorAll('#app-xploit .nav-link')[1]); setTimeout(runScan, 80); } else tlog('cons-out', '// Usage: scan <target>', 'warn'); }
  };
  const h = cmds[p[0]]; if (h) h(); else tlog('cons-out', `// Not found: ${cmd}. Type 'help'.`, 'hi');
}

// ── RENDER HELPERS ──
function renderSidePorts(ports) {
  document.getElementById('port-count').textContent = ports.filter(p => p.state === 'open').length;
  document.getElementById('sc-ports-list').innerHTML = `<table class="port-tbl"><thead><tr><th>PORT</th><th>STATE</th><th>SVC</th></tr></thead><tbody>${ports.map(p => `<tr><td class="${p.state === 'open' ? 'p-open' : 'p-closed'}">${p.port}</td><td class="${p.state === 'open' ? 'p-open' : 'p-closed'}">${p.state}</td><td class="p-svc">${p.service}</td></tr>`).join('')}</tbody></table>`;
}

function renderSideVulns(vulns) {
  document.getElementById('vuln-count').textContent = vulns.length;
  const cls = { CRITICAL: 'crit', HIGH: 'high', MEDIUM: 'med', LOW: 'low' };
  const sc2 = { CRITICAL: 'sc-crit', HIGH: 'sc-high', MEDIUM: 'sc-med', LOW: 'sc-low' };
  document.getElementById('sc-vulns-list').innerHTML = vulns.map(v => `<div class="vc ${cls[v.sev] || 'low'}"><div class="vc-name">${v.name}</div><div class="vc-row"><span class="vc-sev ${sc2[v.sev] || 'sc-low'}">${v.sev}</span><span class="vc-cve">${v.cve}</span></div></div>`).join('');
}

function renderVulnList(sev) {
  const el = document.getElementById('vuln-list');
  const list = sev === 'all' ? G.vulns : G.vulns.filter(v => v.sev === sev);
  if (!list.length) { el.innerHTML = '<div class="empty-msg">// NO VULNERABILITIES FOR THIS FILTER.</div>'; return; }
  const sb = { CRITICAL: 'vb-crit', HIGH: 'vb-high', MEDIUM: 'vb-med', LOW: 'vb-low' };
  const sf = { CRITICAL: 'vfs-crit', HIGH: 'vfs-high', MEDIUM: 'vfs-med', LOW: 'vfs-low' };
  el.innerHTML = list.map(v => `<div class="vf-item"><div class="vf-bar ${sb[v.sev] || 'vb-low'}"></div><div style="flex:1"><div class="vf-name">${v.name}</div><div class="vf-desc">${v.desc}</div><div class="vf-meta"><span class="vf-sev ${sf[v.sev] || 'vfs-low'}">${v.sev}</span>${v.cve ? `<span style="font-family:var(--mono);font-size:9px;color:var(--cream-muted)">${v.cve}</span>` : ''}<span class="vf-tgt">${v.target || ''}</span></div></div></div>`).join('');
}

function filterV(sev, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderVulnList(sev);
}

function renderRecent() {
  const el = document.getElementById('recent-list');
  if (!G.scans.length) { el.innerHTML = '<div class="empty-msg">// NO RECENT SCANS FOUND</div>'; return; }
  const topSev = s => { const v = s.vulns; return v.some(x => x.sev === 'CRITICAL') ? 'CRITICAL' : v.some(x => x.sev === 'HIGH') ? 'HIGH' : v.some(x => x.sev === 'MEDIUM') ? 'MEDIUM' : 'LOW'; };
  const sc2 = { CRITICAL: 'st-crit', HIGH: 'st-high', MEDIUM: 'st-med', LOW: 'st-low' };
  el.innerHTML = [...G.scans].reverse().slice(0, 8).map((s, i) => `<div class="scan-row"><div class="scan-num">${String(i + 1).padStart(2, '0')}</div><div class="scan-tgt">${s.target}</div><span class="sev-tag ${sc2[topSev(s)]}">${topSev(s)}</span><div class="scan-time">${s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`).join('');
}

function renderDb() {
  document.getElementById('db-tag').textContent = G.scans.length + ' RECORDS';
  const el = document.getElementById('db-list');
  if (!G.scans.length) { el.innerHTML = '<div class="empty-msg">// NO SCAN RECORDS.</div>'; return; }
  const sc2 = { CRITICAL: 'st-crit', HIGH: 'st-high', MEDIUM: 'st-med', LOW: 'st-low' };
  const topSev = s => { const v = s.vulns; return v.some(x => x.sev === 'CRITICAL') ? 'CRITICAL' : v.some(x => x.sev === 'HIGH') ? 'HIGH' : v.some(x => x.sev === 'MEDIUM') ? 'MEDIUM' : 'LOW'; };
  el.innerHTML = [...G.scans].reverse().map((s, i) => `<div class="scan-row"><div class="scan-num">${String(i + 1).padStart(2, '0')}</div><div class="scan-tgt">${s.target}</div><span style="font-family:var(--mono);font-size:10px;color:var(--cream-muted);letter-spacing:1px">${s.ports.length} ports · ${s.vulns.length} vulns</span><span class="sev-tag ${sc2[topSev(s)]}">${topSev(s)}</span><div class="scan-time">${s.time.toLocaleDateString()} ${s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`).join('');
}

function updatePortView(ports, os) {
  const open = ports.filter(p => p.state === 'open');
  document.getElementById('ps-tot').textContent    = ports.length;
  document.getElementById('ps-open').textContent   = open.length;
  document.getElementById('ps-closed').textContent = ports.length - open.length;
  document.getElementById('ps-os').textContent     = os || '--';
  document.getElementById('port-tag').textContent  = open.length + ' PORTS FOUND';
  document.getElementById('port-tbody').innerHTML  = ports.map(p => `<tr><td class="${p.state === 'open' ? 'p-open' : 'p-closed'}">${p.port}/tcp</td><td class="${p.state === 'open' ? 'p-open' : 'p-closed'}">${p.state.toUpperCase()}</td><td class="p-svc">${p.service}</td><td style="color:var(--cream-muted)">${p.version || '--'}</td></tr>`).join('');
}

function refreshStats() {
  document.getElementById('s-scans').textContent = G.scans.length;
  document.getElementById('s-vulns').textContent = G.vulns.length;
  document.getElementById('s-ports').textContent = G.ports.length;
}

function portOnly() {
  const t = document.getElementById('port-url').value.trim();
  if (!t) { notif('// ENTER A TARGET', 'err'); return; }
  document.getElementById('scan-url').value = t;
  document.getElementById('sc-ports').checked = true;
  document.getElementById('sc-vulns').checked = false;
  xnav('scanner', document.querySelectorAll('#app-xploit .nav-link')[1]);
  setTimeout(runScan, 80);
}

// ── TERMINAL HELPERS ──
function tlog(id, text, type = '') {
  const el = document.getElementById(id);
  const s = document.createElement('span');
  s.className = 'tl' + (type ? ' tl-' + type : '');
  s.textContent = text; el.appendChild(s); el.scrollTop = el.scrollHeight;
}

function clearT(id) { document.getElementById(id).innerHTML = ''; }

// ── PROGRESS BAR ──
const STEPS = ['ps-init', 'ps-recon', 'ps-ports', 'ps-vulns', 'ps-report'];

function showProg(show) {
  document.getElementById('prog-panel').style.display = show ? 'block' : 'none';
  if (!show) {
    STEPS.forEach(s => { const el = document.getElementById(s); el.classList.remove('done', 'run'); });
    document.getElementById('prog-fill').style.width = '0%';
    document.getElementById('prog-pct').textContent = '0%';
  }
}

async function setStep(id) {
  const idx = STEPS.indexOf(id);
  for (let i = 0; i < idx; i++) { const el = document.getElementById(STEPS[i]); el.classList.remove('run'); el.classList.add('done'); }
  document.getElementById(id).classList.add('run'); await sl(80);
}

async function progAnim(from, to, dur) {
  const bar = document.getElementById('prog-fill');
  const pct = document.getElementById('prog-pct');
  const start = performance.now();
  return new Promise(r => {
    function f(now) { const t = Math.min((now - start) / dur, 1); const v = from + (to - from) * t; bar.style.width = v + '%'; pct.textContent = Math.round(v) + '%'; t < 1 ? requestAnimationFrame(f) : r(); }
    requestAnimationFrame(f);
  });
}

// ── UI HELPERS ──
function notif(msg, type = '') {
  const n = document.createElement('div');
  n.className = 'notif' + (type ? ' ' + type : '');
  n.textContent = msg; document.body.appendChild(n);
  setTimeout(() => n.remove(), 3200);
}

function scorePop(txt) {
  const el = document.createElement('div');
  el.className = 'score-pop'; el.textContent = txt;
  el.style.cssText = `left:${window.innerWidth / 2 - 30}px;top:${window.innerHeight / 2}px`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1600);
}

function sl(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── INIT ──
selCh(0);
