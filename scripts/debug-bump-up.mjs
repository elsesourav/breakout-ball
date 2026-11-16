import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const tempDir = `/tmp/chrome_dbg_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9336',
    `--user-data-dir=${tempDir}`,
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9336/json/list');
        if (res.ok) {
          listRes = res;
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
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

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send('Page.navigate', { url: 'http://localhost:3000' });

    // Set uncollected achievement in storage
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('breakout_achievements_v1', JSON.stringify(['first_blood']));
          localStorage.setItem('breakout_achievement_claims_v1', JSON.stringify([]));
          localStorage.setItem('breakout_currency', '100');
        })()
      `
    });

    await send('Page.reload');

    // Wait until app loaded
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 400));
      const loadingRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const loader = document.querySelector('.z-\\\\[9999\\\\]');
            const profileBtn = document.querySelector('button[title="Pilot Profile"]');
            return !loader && !!profileBtn;
          })()
        `,
        returnByValue: true
      });
      if (loadingRes?.result?.value) break;
    }

    // Open profile
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[title="Pilot Profile"]')?.click()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check achievement buttons
    const btnInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = document.querySelector('button[title*="Collect 15 Cores"]');
          return {
            found: !!claimBtn,
            text: claimBtn ? claimBtn.textContent : null,
            badgeInitial: document.getElementById('top-cores-badge')?.textContent?.trim()
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Claim button info:', btnInfo.result.value);

    // Click claim button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = document.querySelector('button[title*="Collect 15 Cores"]');
          if (claimBtn) {
            claimBtn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true
    });

    // Sample badge state every 150ms from 0ms to 1800ms
    for (let t = 0; t <= 1800; t += 150) {
      await new Promise(r => setTimeout(r, 150));
      const sample = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const badge = document.getElementById('top-cores-badge');
            return {
              text: badge ? badge.textContent?.trim() : '',
              transform: badge ? window.getComputedStyle(badge).transform : '',
              boxShadow: badge ? window.getComputedStyle(badge).boxShadow : '',
              styleTransform: badge ? badge.style.transform : ''
            };
          })()
        `,
        returnByValue: true
      });
      console.log(`t=${t}ms:`, sample.result.value);
    }

    chrome.kill();
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
  }
}

run();
