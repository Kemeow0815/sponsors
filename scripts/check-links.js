const fs = require('fs');
const path = require('path');

const SPONSORS_FILE = path.join(__dirname, '..', 'data', 'sponsors', 'sponsors.json');
const TIMEOUT_MS = 10000;

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    // SSRF Protection
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { ok: false, error: 'Invalid protocol' };
    }
    
    const hostname = urlObj.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { ok: false, error: 'Localhost not allowed' };
    }
    if (/^10\./.test(hostname)) {
      return { ok: false, error: 'Private IP not allowed' };
    }
    if (/^192\.168\./.test(hostname)) {
      return { ok: false, error: 'Private IP not allowed' };
    }
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
      return { ok: false, error: 'Private IP not allowed' };
    }

    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': 'sponsor-page-checker/1.0 (+github actions)',
        accept: 'text/html,application/json,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  } finally {
    clearTimeout(timer);
  }
}

async function loadSponsors() {
  try {
    const content = fs.readFileSync(SPONSORS_FILE, 'utf8');
    const data = JSON.parse(content);
    return data.sponsors || [];
  } catch (e) {
    console.error('Error reading sponsors file:', e.message);
    return [];
  }
}

async function main() {
  console.log('Checking sponsor links...\n');
  
  const sponsors = await loadSponsors();
  
  if (sponsors.length === 0) {
    console.log('No sponsors found.');
    process.exit(0);
  }
  
  const toRemove = [];
  let hasErrors = false;
  
  for (let i = 0; i < sponsors.length; i++) {
    const sponsor = sponsors[i];
    const { name, avatar } = sponsor;
    
    console.log(`Checking: ${name}`);
    
    if (avatar) {
      const result = await checkUrl(avatar);
      
      if (result.ok) {
        console.log(`  ✓ Avatar reachable (${result.status})`);
      } else {
        console.log(`  ✗ Avatar unreachable: ${result.error || result.status}`);
        toRemove.push(i);
        hasErrors = true;
      }
    } else {
      console.log(`  - No avatar URL`);
    }
    
    console.log('');
  }
  
  if (toRemove.length > 0) {
    console.log(`\nRemoving ${toRemove.length} unreachable sponsor(s):`);
    
    // Remove from the end to avoid index shifting
    toRemove.reverse().forEach(index => {
      const sponsor = sponsors[index];
      console.log(`  ✓ Removed ${sponsor.name}`);
      sponsors.splice(index, 1);
    });
    
    // Save updated sponsors.json
    try {
      const updatedData = { sponsors };
      fs.writeFileSync(SPONSORS_FILE, JSON.stringify(updatedData, null, 2));
      console.log('  ✓ Updated sponsors.json');
    } catch (e) {
      console.error('  ✗ Failed to update sponsors.json:', e.message);
    }
    
    console.log('\nSome sponsors were removed due to unreachable links.');
    process.exit(1);
  } else {
    console.log('\n✓ All sponsor links are reachable!');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
