import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const tempDir = `/tmp/chrome_test_verify_bump_up_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9332',
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
        const res = await fetch('http://127.0.0.1:9332/json/list');
        if (res.ok) {
          listRes = res;
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 500));
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

    // Set uncollected achievement in storage & reset daily collect
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('breakout_achievements_v1', JSON.stringify(['first_blood', 'speed_demon']));
          localStorage.setItem('breakout_achievement_claims_v1', JSON.stringify([]));
          localStorage.setItem('breakout_currency', '100');
          localStorage.removeItem('breakout_daily_collect_last');
          sessionStorage.setItem('forceFree', '1');
        })()
      `
    });

    // Reload page
    await send('Page.reload');

    // Wait until app loaded
    for (let i = 0; i < 40; i++) {
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
      if (loadingRes?.result?.value) {
        break;
      }
    }

    await new Promise(r => setTimeout(r, 800));

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Profile View Claim
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 1: PROFILE VIEW ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1200));

    // Get initial badge text
    const initBadge = await send('Runtime.evaluate', {
      expression: `document.getElementById('top-cores-badge')?.textContent?.trim()`,
      returnByValue: true
    });
    console.log('Initial Profile badge text:', initBadge.result.value);

    // Click claim button for First Impact (+15 cores)
    const clickedProfile = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = document.querySelector('button[title*="Collect 15 Cores"]') ||
                           Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('CLAIM') && b.textContent?.includes('+15'));
          if (claimBtn) {
            claimBtn.click();
            return { clicked: true, title: claimBtn.title, text: claimBtn.textContent };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Profile claim click result:', clickedProfile.result.value);

    // Sample at 850ms (during collecting & bump-up time)
    await new Promise(r => setTimeout(r, 850));

    const duringProfile = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.getElementById('top-cores-badge');
          const transform = badge ? window.getComputedStyle(badge).transform : 'none';
          const text = badge ? badge.textContent?.trim() : '';
          const pulsing = badge ? badge.getAttribute('data-pulsing') : null;
          const hasBumpClass = badge ? badge.classList.contains('core-counter-bump-active') : false;
          return { transform, text, pulsing, hasBumpClass };
        })()
      `,
      returnByValue: true
    });
    console.log('During Profile collection (850ms):', duringProfile.result.value);

    const profileSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_bump_up.png', Buffer.from(profileSnap.data, 'base64'));

    // Wait until collection complete (1800ms total after click)
    await new Promise(r => setTimeout(r, 1000));

    const afterProfile = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.getElementById('top-cores-badge');
          const transform = badge ? window.getComputedStyle(badge).transform : 'none';
          const text = badge ? badge.textContent?.trim() : '';
          const pulsing = badge ? badge.getAttribute('data-pulsing') : null;
          const hasBumpClass = badge ? badge.classList.contains('core-counter-bump-active') : false;
          return { transform, text, pulsing, hasBumpClass };
        })()
      `,
      returnByValue: true
    });
    console.log('After Profile collection complete (1850ms):', afterProfile.result.value);

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Shop View Claim
    // ─────────────────────────────────────────────────────────────
    console.log('--- TEST 2: SHOP VIEW ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title*="Back"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const shopNav = Array.from(document.querySelectorAll('button')).find(b => b.title === 'SHOP');
          if (shopNav) shopNav.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    const initShopBadge = await send('Runtime.evaluate', {
      expression: `document.getElementById('top-cores-badge')?.textContent?.trim()`,
      returnByValue: true
    });
    console.log('Initial Shop badge text:', initShopBadge.result.value);

    // Click daily claim (CLAIM FREE)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const claimDaily = btns.find(b => b.textContent?.includes('CLAIM FREE'));
          if (claimDaily) {
            claimDaily.click();
            return true;
          }
          return false;
        })()
      `
    });

    // Sample at 850ms (during collecting & bump-up time)
    await new Promise(r => setTimeout(r, 850));

    const duringShop = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.getElementById('top-cores-badge');
          const transform = badge ? window.getComputedStyle(badge).transform : 'none';
          const text = badge ? badge.textContent?.trim() : '';
          return { transform, text };
        })()
      `,
      returnByValue: true
    });
    console.log('During Shop collection (850ms):', duringShop.result.value);

    const shopSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_shop_bump_up.png', Buffer.from(shopSnap.data, 'base64'));

    // Wait until complete (1800ms total)
    await new Promise(r => setTimeout(r, 1000));

    const afterShop = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.getElementById('top-cores-badge');
          const transform = badge ? window.getComputedStyle(badge).transform : 'none';
          const text = badge ? badge.textContent?.trim() : '';
          return { transform, text };
        })()
      `,
      returnByValue: true
    });
    console.log('After Shop collection complete (1850ms):', afterShop.result.value);

    console.log('All tests completed successfully!');
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
