import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--user-data-dir=/tmp/chrome_test_verify_settings',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9277/json/list');
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

    await send('Runtime.enable');

    // 1. Navigate to Arcade with forceFree=1
    await send('Page.navigate', { url: 'http://localhost:3000?forceFree=1' });
    await new Promise(r => setTimeout(r, 3500));

    // Verify Arcade header
    const checkArcade = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const freeBtn = document.getElementById('daily-free-collect-button');
          const coresBadge = document.getElementById('top-cores-badge');
          const settingsBtn = document.querySelector('button[title="System Settings"]');
          return {
            hasFree: !!freeBtn,
            hasCoresBadge: !!coresBadge,
            hasSettingsBtn: !!settingsBtn
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Arcade Header check:', checkArcade.result?.value);

    // Screenshot 1: Arcade with Stars, Free, Cores, and Settings icon
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_arcade_settings_icon.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_arcade_settings_icon.png');

    // 2. Click Settings button on Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="System Settings"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Verify Settings Modal open
    const checkModal = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const modalTitle = Array.from(document.querySelectorAll('*')).some(el => el.textContent === 'SYSTEM SETTINGS');
          const hasMasterAudio = Array.from(document.querySelectorAll('*')).some(el => el.textContent === 'MASTER AUDIO');
          return { modalOpen: modalTitle, hasMasterAudio };
        })()
      `,
      returnByValue: true
    });
    console.log('Settings Modal open check:', checkModal.result?.value);

    // Screenshot 2: Settings Modal open
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_settings_modal_open.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_settings_modal_open.png');

    // 3. Close Settings modal
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtn = document.querySelector('button[title="Close Settings"]');
          if (closeBtn) closeBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    // 4. Click Pilot button on Side Nav to go to Profile
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pilotBtn = document.querySelector('button[title="PILOT"]');
          if (pilotBtn) pilotBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot 3: Profile view with top header Cores + Settings icon
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_profile_with_settings_icon.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_profile_with_settings_icon.png');

    // 5. Click Settings icon from Profile header
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="System Settings"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot 4: Settings modal opened from Profile
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_settings_modal_from_profile.png', Buffer.from(snap4.data, 'base64'));
    console.log('Saved verify_settings_modal_from_profile.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill();
  }
}

run();
