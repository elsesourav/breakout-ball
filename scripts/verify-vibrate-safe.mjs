import { spawn } from 'child_process';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--user-data-dir=/tmp/chrome_test_vibrate_clean',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  chrome.stderr.on('data', d => console.error('CHROME STDERR:', d.toString()));
  chrome.stdout.on('data', d => console.log('CHROME STDOUT:', d.toString()));

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://127.0.0.1:9277/json/list');
  const pages = await listRes.json();
  const page = pages.find((p) => p.type === 'page');
  if (!page) {
    console.error('Failed to find page');
    chrome.kill();
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

  const interventions = [];
  ws.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Log.entryAdded' && d.params?.entry?.source === 'intervention') {
      interventions.push(d.params.entry.text);
      console.log('Intervention logged by browser:', d.params.entry.text);
    }
  });

  await send('Log.enable');
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('1. Checking page state before user interaction:');
  const preCheck = await send('Runtime.evaluate', {
    expression: `
      ({
        hasBeenActive: navigator.userActivation?.hasBeenActive,
        isActive: navigator.userActivation?.isActive
      })
    `,
    returnByValue: true
  });
  console.log('Pre-tap activation:', preCheck.result?.value);

  console.log('2. Calling safeVibrate(20) BEFORE user tap:');
  const safeVibPre = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `
      (async () => {
        const mod = await import('/src/utils/haptics.ts');
        const canVib = mod.canVibrate();
        const res = mod.safeVibrate(20);
        return { canVibrate: canVib, dispatched: res };
      })()
    `,
    returnByValue: true
  });
  console.log('safeVibrate before tap result:', safeVibPre.result?.value);

  console.log('3. Simulating user tap/click on the frame:');
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 200, y: 300, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 200, y: 300, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 400));

  const postCheck = await send('Runtime.evaluate', {
    expression: `
      ({
        hasBeenActive: navigator.userActivation?.hasBeenActive,
        isActive: navigator.userActivation?.isActive
      })
    `,
    returnByValue: true
  });
  console.log('Post-tap activation:', postCheck.result?.value);

  console.log('4. Calling safeVibrate(20) AFTER user tap:');
  const safeVibPost = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `
      (async () => {
        const mod = await import('/src/utils/haptics.ts');
        const canVib = mod.canVibrate();
        const res = mod.safeVibrate(20);
        return { canVibrate: canVib, dispatched: res };
      })()
    `,
    returnByValue: true
  });
  console.log('safeVibrate after tap result:', safeVibPost.result?.value);

  console.log('3. Checking if any vibrate interventions occurred:');
  const vibrateInterventions = interventions.filter(i => i.toLowerCase().includes('vibrate'));
  console.log('Vibrate interventions count:', vibrateInterventions.length);

  ws.close();
  chrome.kill();
  if (vibrateInterventions.length === 0) {
    console.log('SUCCESS: No navigator.vibrate interventions occurred!');
    process.exit(0);
  } else {
    console.error('FAILED: Vibrate intervention detected:', vibrateInterventions);
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
