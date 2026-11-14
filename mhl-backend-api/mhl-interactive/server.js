import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { teams, matches } from './js/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DB_PATH = path.join(__dirname, 'server/data/db.json');
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
async function readDb() { try { return JSON.parse(await fs.readFile(DB_PATH, 'utf8')); } catch { return { favorites: [], orders: [], supportRequests: [] }; } }
async function writeDb(db) { await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8'); }
function send(res, status, data) { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*' }); res.end(JSON.stringify(data)); }
async function body(req) { let raw=''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { status:'ok', service:'MHL API' });
      if (req.method === 'GET' && url.pathname === '/api/matches') return send(res, 200, matches);
      if (req.method === 'GET' && url.pathname === '/api/teams') return send(res, 200, teams);
      if (req.method === 'GET' && url.pathname === '/api/favorites') return send(res, 200, (await readDb()).favorites);
      if (req.method === 'POST' && url.pathname === '/api/favorites') {
        const { teamId } = await body(req); if (!teams.some(t => t.id === teamId)) return send(res, 400, { error:'Неизвестная команда' });
        const db = await readDb(); if (!db.favorites.includes(teamId)) db.favorites.push(teamId); await writeDb(db); return send(res, 201, { favorites:db.favorites });
      }
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/favorites/')) {
        const id = decodeURIComponent(url.pathname.split('/').pop()); const db = await readDb(); db.favorites = db.favorites.filter(item => item !== id); await writeDb(db); return send(res, 200, { favorites:db.favorites });
      }
      if (req.method === 'POST' && url.pathname === '/api/orders') {
        const { matchId, seat, customerEmail, customerName } = await body(req); const match = matches.find(m => m.id === matchId);
        if (!match || !seat || !customerEmail || !customerName) return send(res, 400, { error:'Заполните данные заказа' });
        const db = await readDb(); const order = { id:`MHL-${Date.now()}`, matchId, match:`${match.home} — ${match.away}`, seat, customerEmail, customerName, createdAt:new Date().toISOString(), status:'created' };
        db.orders.push(order); await writeDb(db); return send(res, 201, { message:'Заказ сохранён на сервере', order });
      }
      if (req.method === 'POST' && url.pathname === '/api/support') {
        const { message } = await body(req); if (!message?.trim()) return send(res, 400, { error:'Введите текст обращения' });
        const db = await readDb(); const request = { id:`SUP-${Date.now()}`, message:message.trim(), createdAt:new Date().toISOString() }; db.supportRequests.push(request); await writeDb(db); return send(res, 201, { message:'Обращение сохранено', request });
      }
      return send(res, 404, { error:'API endpoint не найден' });
    }
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = path.resolve(__dirname, `.${requested}`);
    if (!filePath.startsWith(__dirname + path.sep) && filePath !== path.join(__dirname, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
    const content = await fs.readFile(filePath); res.writeHead(200, { 'Content-Type':MIME[path.extname(filePath)] || 'application/octet-stream' }); res.end(content);
  } catch (error) { console.error(error); if (!res.headersSent) send(res, 500, { error:'Внутренняя ошибка сервера' }); }
});
server.listen(PORT, () => console.log(`MHL site and API: http://localhost:${PORT}`));
