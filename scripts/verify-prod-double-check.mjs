import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9271',
    '--user-data-dir=/tmp/chrome_test_verify_prod_double_check',
    '--window-size=430,932',
    'https://breakout.elsesourav.com'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9271/json/list');
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
    await send('Page.navigate', { url: 'https://breakout.elsesourav.com' });
    await new Promise(r => setTimeout(r, 4500));

    // 1. Check Arcade View
    const arcadeCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const node1 = document.getElementById('roadmap-level-node-1');
          return { exists: !!node1, text: node1?.innerText };
        })()
      `,
      returnByValue: true
    });
    console.log('1. Prod Arcade Check:', arcadeCheck?.result?.value);

    // 2. Click Level 1 to open Preview Modal & Leaderboard
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const node1 = document.getElementById('roadmap-level-node-1');
          if (node1) node1.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const previewModalCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('START'));
          return { modalOpen: !!startBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('2. Prod Level Preview Modal Check:', previewModalCheck?.result?.value);

    // Close Modal
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backdrop = document.querySelector('.bg-black\\/80') || document.querySelector('.fixed.inset-0');
          if (backdrop) backdrop.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Switch to Arena Tab
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Arena"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const arenaCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const apex = Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('DAILY APEX MISSION'));
          const addBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('ADD ARENA'));
          return { hasApexMission: apex, hasAddArenaBtn: addBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('3. Prod Arena Check:', arenaCheck?.result?.value);

    // 4. Switch to Armory Tab
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Armory"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const armoryCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const upgrades = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('UPGRADES'));
          const shop = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('CORE SHOP'));
          return { hasUpgrades: upgrades, hasShop: shop };
        })()
      `,
      returnByValue: true
    });
    console.log('4. Prod Armory Check:', armoryCheck?.result?.value);

    // 5. Switch to Profile Tab
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Profile"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    const profileCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badges = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('BADGES'));
          const leaderboard = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('LEADERBOARD'));
          return { hasBadges: badges, hasLeaderboard: leaderboard };
        })()
      `,
      returnByValue: true
    });
    console.log('5. Prod Profile Check:', profileCheck?.result?.value);

    // 6. Switch to Arena and open Studio
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Arena"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const add = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('ADD ARENA'));
          if (add) add.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    // In Studio, click 'DESIGN NEW ARENA' to test LevelDesigner
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const design = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('DESIGN NEW ARENA'));
          if (design) design.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2200));

    const designerCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('MATRIX FORGE'));
          const saveBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('SAVE'));
          return { hasMatrixForge: title, hasSaveBtn: saveBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('6. Prod Studio / LevelDesigner Check:', designerCheck?.result?.value);

    // Capture visual confirmation
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_prod_double_check_success.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verify_prod_double_check_success.png');

    console.log('\n--- PROD CONSOLE ERRORS CAPTURED ---');
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
