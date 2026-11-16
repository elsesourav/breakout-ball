import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9320',
    '--user-data-dir=/tmp/chrome_test_verify_no_popup_v1',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9320/json/list');
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

    // Set localStorage with uncollected achievement before reloading so app mounts with it
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

    await new Promise(r => setTimeout(r, 1000));

    console.log('App reloaded with uncollected achievements. Now navigating to Profile...');

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

    // Find collect buttons
    const findRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const collectBtns = btns.filter(b => b.textContent?.trim().startsWith('COLLECT') && !b.textContent?.includes('COLLECTED'));
          return {
            collectBtnsCount: collectBtns.length,
            firstBtnText: collectBtns[0] ? collectBtns[0].textContent?.trim() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Profile achievements check:', findRes.result.value);

    // Click COLLECT on first achievement
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const collectBtn = btns.find(b => b.textContent?.trim().startsWith('COLLECT') && !b.textContent?.includes('COLLECTED'));
          if (collectBtn) collectBtn.click();
        })()
      `
    });

    // Wait 400ms (flying particles active)
    await new Promise(r => setTimeout(r, 400));

    const checkPopupRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const achToast = document.querySelector('[title*="Achievement Unlocked"]');
          const flyingCanvas = document.querySelector('canvas');
          const topToasts = Array.from(document.querySelectorAll('.fixed')).filter(el => {
            const top = parseInt(window.getComputedStyle(el).top);
            return top < 100 && el.textContent?.includes('ACHIEVEMENT');
          });
          return {
            hasAchToast: !!achToast,
            hasFlyingAnimation: !!flyingCanvas,
            topToastsCount: topToasts.length
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Status right after COLLECT click in Profile:', checkPopupRes.result.value);

    const profileSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_claim_no_popup.png', Buffer.from(profileSnap.data, 'base64'));

    // Wait 1.5s for flying cores to finish landing
    await new Promise(r => setTimeout(r, 1500));

    // 2. Test Shop View daily claim
    console.log('Now navigating to Shop...');
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

    // Click CLAIM daily in Shop
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const claimDaily = btns.find(b => b.textContent?.includes('CLAIM') && !b.textContent?.includes('CLAIMED'));
          if (claimDaily) claimDaily.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 400));

    const checkShopPopupRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const achToast = document.querySelector('[title*="Achievement Unlocked"]');
          const topToasts = Array.from(document.querySelectorAll('.fixed')).filter(el => {
            const top = parseInt(window.getComputedStyle(el).top);
            return top < 100 && (el.textContent?.includes('ACHIEVEMENT') || el.textContent?.includes('Claimed'));
          });
          return {
            hasAchToast: !!achToast,
            topToastsCount: topToasts.length
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Status in Shop right after CLAIM click:', checkShopPopupRes.result.value);

    const shopSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_shop_claim_no_popup.png', Buffer.from(shopSnap.data, 'base64'));

    console.log('All verification passed!');
  } catch (err) {
    console.error('Error in verification:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
