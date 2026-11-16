import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9272',
    '--user-data-dir=/tmp/chrome_test_verify_side_nav',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9272/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) {
      console.error('No page found');
      return;
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const msgId = id++;
        const handler = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    const consoleErrors = [];
    ws.addEventListener('message', (e) => {
      const d = JSON.parse(e.data);
      if (d.method === 'Runtime.consoleAPICalled' && d.params?.type === 'error') {
        const errText = d.params.args.map(a => a.value || a.description).join(' ');
        consoleErrors.push(errText);
      }
    });

    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3500));

    // 1. Check Arcade View & Capture Screenshot
    const arcadeCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sideArena = document.getElementById('side-nav-online');
          const sideArmory = document.getElementById('side-nav-armory');
          const sideStudio = document.getElementById('side-nav-create');
          const sideProfile = document.getElementById('side-nav-profile');
          const coresBadge = document.getElementById('top-cores-badge');
          const bottomNav = document.querySelector('nav[aria-label="Game Navigation"]');
          return {
            hasSideArena: !!sideArena,
            hasSideArmory: !!sideArmory,
            hasSideStudio: !!sideStudio,
            hasSideProfile: !!sideProfile,
            hasTopCoresBadge: !!coresBadge,
            coresBadgeText: coresBadge?.innerText,
            bottomNavRemoved: !bottomNav
          };
        })()
      `,
      returnByValue: true
    });
    console.log('1. Arcade & Side Nav Check:', arcadeCheck?.result?.value);

    const shotArcade = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_side_nav_arcade.png', Buffer.from(shotArcade.data, 'base64'));
    console.log('Saved verify_side_nav_arcade.png');

    // 2. Click Side Arena Button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('side-nav-online');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const arenaCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ARCADE'));
          const topCores = document.getElementById('top-cores-badge');
          return {
            hasBackButton: !!backBtn,
            hasTopCoresBadge: !!topCores,
            url: window.location.pathname
          };
        })()
      `,
      returnByValue: true
    });
    console.log('2. Arena View Check:', arenaCheck?.result?.value);

    const shotArena = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_side_nav_arena.png', Buffer.from(shotArena.data, 'base64'));
    console.log('Saved verify_side_nav_arena.png');

    // 3. Click Back to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ARCADE'));
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // 4. Click Side Armory Button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('side-nav-armory');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const armoryCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ARCADE'));
          const topCores = document.getElementById('top-cores-badge');
          return {
            hasBackButton: !!backBtn,
            hasTopCoresBadge: !!topCores,
            url: window.location.pathname
          };
        })()
      `,
      returnByValue: true
    });
    console.log('3. Armory View Check:', armoryCheck?.result?.value);

    const shotArmory = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_side_nav_armory.png', Buffer.from(shotArmory.data, 'base64'));
    console.log('Saved verify_side_nav_armory.png');

    // 5. Click Back and Go to Profile
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ARCADE'));
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('side-nav-profile');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const profileCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ARCADE'));
          const profileHero = Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Anonymous') || el.textContent?.includes('CORES'));
          return {
            hasBackButton: !!backBtn,
            hasProfileHero: profileHero
          };
        })()
      `,
      returnByValue: true
    });
    console.log('4. Profile View Check:', profileCheck?.result?.value);

    const shotProfile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_side_nav_profile.png', Buffer.from(shotProfile.data, 'base64'));
    console.log('Saved verify_side_nav_profile.png');

    console.log('\n--- CONSOLE ERRORS CAPTURED ---');
    console.log('Error count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
