// api/proxy.js - 终极修复：Alchemy 代理 + BUY SWAP 按钮注入（Vercel ESM 兼容，jsdom 版）
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const targetUrl = 'https://dashboard.alchemy.com';

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    let html = await response.text();

    // jsdom 注入按钮（简化，避免任何语法冲突）
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const body = document.querySelector('body');
    if (body) {
      // 悬浮按钮
      const fixedBtn = document.createElement('div');
      fixedBtn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;';
      fixedBtn.innerHTML = `
        <a href="https://zephyswap.online/" target="_blank">
          <button style="
            padding:16px 48px;
            background:linear-gradient(135deg,#00ff88,#00cc70);
            color:#000;font-weight:900;font-size:22px;
            border:none;border-radius:22px;cursor:pointer;
            box-shadow:0 10px 50px rgba(0,255,136,0.8);
            text-transform:uppercase;letter-spacing:2.5px;
            transition:all 0.3s;
          " onmouseover="this.style.transform=\'scale(1.1)\'"
            onmouseout="this.style.transform=\'scale(1)\'">
            BUY SWAP
          </button>
        </a>
      `;
      body.appendChild(fixedBtn);

      // 动态 JS 注入导航栏
      const script = document.createElement('script');
      script.innerHTML = `
        setTimeout(function() {
          var nav = document.querySelector('nav, header, [role="navigation"]');
          if (nav) {
            var btn = document.createElement('a');
            btn.href = 'https://zephyswap.online/';
            btn.target = '_blank';
            btn.style.marginLeft = '24px';
            btn.innerHTML = '<button style="padding:14px 40px;background:linear-gradient(135deg,#00ff88,#00cc70);color:#000;font-weight:900;font-size:20px;border:none;border-radius:18px;cursor:pointer;box-shadow:0 8px 35px rgba(0,255,136,0.6);text-transform:uppercase;letter-spacing:2px;">BUY SWAP</button>';
            nav.appendChild(btn);
          }
        }, 2000);
      `;
      body.appendChild(script);
    }

    html = dom.serialize();

    res.status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send(`
      <html><body>
        <h1>Proxy Error</h1>
        <p>${error.message}</p>
        <p>Try again or check logs.</p>
      </body></html>
    `);
  }
}
