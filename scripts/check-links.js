const fs = require('fs');
const path = require('path');

const SPONSORS_DIR = path.join(__dirname, '..', 'data', 'sponsors');
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
  const sponsors = [];
  
  try {
    const files = fs.readdirSync(SPONSORS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'sponsors.json') {
        const filePath = path.join(SPONSORS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        try {
          const data = JSON.parse(content);
          sponsors.push({
            filename: file,
            data: data
          });
        } catch (e) {
          console.error(`Failed to parse ${file}:`, e.message);
        }
      }
    }
  } catch (e) {
    console.error('Error reading sponsors directory:', e.message);
  }
  
  return sponsors;
}

async function main() {
  console.log('Checking sponsor links...\n');
  
  const sponsors = await loadSponsors();
  const toDelete = [];
  let hasErrors = false;
  
  for (const sponsor of sponsors) {
    const { filename, data } = sponsor;
    const { name, avatar } = data;
    
    console.log(`Checking: ${name} (${filename})`);
    
    if (avatar) {
      const result = await checkUrl(avatar);
      
      if (result.ok) {
        console.log(`  ✓ Avatar reachable (${result.status})`);
      } else {
        console.log(`  ✗ Avatar unreachable: ${result.error || result.status}`);
        toDelete.push(filename);
        hasErrors = true;
      }
    } else {
      console.log(`  - No avatar URL`);
    }
    
    console.log('');
  }
  
  if (toDelete.length > 0) {
    console.log(`\nRemoving ${toDelete.length} unreachable sponsor(s):`);
    
    for (const filename of toDelete) {
      const filePath = path.join(SPONSORS_DIR, filename);
      
      try {
        fs.unlinkSync(filePath);
        console.log(`  ✓ Deleted ${filename}`);
      } catch (e) {
        console.error(`  ✗ Failed to delete ${filename}:`, e.message);
      }
    }
    
    // Update sponsors.json
    const manifestPath = path.join(SPONSORS_DIR, 'sponsors.json');
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.files = manifest.files.filter(f => !toDelete.includes(f));
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
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
