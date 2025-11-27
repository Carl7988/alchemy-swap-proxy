// api/proxy.js - Alchemy 代理 + BUY SWAP 按钮注入
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { url } = req.query;
  const targetUrl = url || 'https://dashboard.alchemy.com';

  try {
    // 伪装浏览器请求
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    let html = await response.text();

    // 用 cheerio 注入按钮（静态 + 动态 JS）
    const $ = cheerio.load(html);
    $('nav, header, body').append(`
      <div style="position:fixed;top:20px;right:20px;z-index:99999;">
        <a href="https://zephyswap.online/" target="_blank">
          <button style="
            padding:16px 48px;
            background:linear-gradient(135deg,#00ff88,#00cc70);
            color:#000;font-weight:900;font-size:22px;
            border:none;border-radius:22px;cursor:pointer;
            box-shadow:0 10px 50px rgba(0,255,136,0.8);
            text-transform:uppercase;letter-spacing:2.5px;
            transition:all 0.3s;
          " onmouseover="this.style.transform='scale(1.1)'"
            onmouseout="this.style.transform='scale(1)'">
            BUY SWAP
          </button>
        </a>
      </div>
      <script>
        setTimeout(() => {
          const nav = document.querySelector('nav, header');
          if (nav) {
            nav.insertAdjacentHTML('beforeend', '<a href="https://zephyswap.online/" target="_blank" style="margin-left:24px;"><button style="padding:14px 40px;background:linear-gradient(135deg,#00ff88,#00cc70);color:#000;font-weight:900;font-size:20px;border:none;border-radius:18px;cursor:pointer;box-shadow:0 8px 35px rgba(0,255,136,0.6);text-transform:uppercase;letter-spacing:2px;">BUY SWAP</button></a>');
          }
        }, 2000);
      </script>
    `);

    html = $.html();

    res.status(200).setHeader('Content-Type', 'text/html').send(html);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}
