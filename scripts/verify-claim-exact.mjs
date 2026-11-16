import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9325',
    '--user-data-dir=/tmp/chrome_test_verify_claim_exact',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9325/json/list');
        if (listRes.ok) break;
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

    // Set uncollected achievement in storage
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('breakout_achievements_v1', JSON.stringify(['first_blood', 'speed_demon']));
          localStorage.setItem('breakout_achievement_claims_v1', JSON.stringify([]));
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

    // Navigate to Profile
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1200));

    // Click the CLAIM button
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = document.querySelector('button[title*="Collect 15 Cores"]');
          if (claimBtn) {
            claimBtn.click();
            return { clicked: true, title: claimBtn.title };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Clicked claim button:', clickRes.result.value);

    // Wait 350ms during flight animation
    await new Promise(r => setTimeout(r, 350));

    const checkPopupRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const achToast = document.querySelector('[title*="Achievement Unlocked"]');
          const topToasts = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            const isToast = text.includes('ACHIEVEMENT UNLOCKED');
            const style = window.getComputedStyle(el);
            return isToast && style.position === 'fixed';
          });
          return {
            hasAchToast: !!achToast,
            topToastsCount: topToasts.length
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Top popup check during achievement flight:', checkPopupRes.result.value);

    const flightSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_claimed_flight_no_popup.png', Buffer.from(flightSnap.data, 'base64'));

    // Wait 1.5s for particles to land and cores counter to update
    await new Promise(r => setTimeout(r, 1500));

    const afterSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_after_claim_no_popup.png', Buffer.from(afterSnap.data, 'base64'));

    console.log('Flight and post-claim screenshots saved');
  } catch (err) {
    console.error('Error in verification:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
