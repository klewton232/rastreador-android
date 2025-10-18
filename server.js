import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'data.json');

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); }
  catch(e){ return { devices: {}, last: {} }; }
}
function saveDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Registrar device (gera id + token)
app.post('/register', (req,res)=>{
  const { name, email } = req.body || {};
  if(!name) return res.status(400).json({error:'name obrigatório'});
  const db = loadDB();
  const id = uuidv4();
  const token = uuidv4();
  db.devices[id] = { id, name, email: email||'', token, createdAt: new Date().toISOString() };
  saveDB(db);
  res.json({ deviceId: id, deviceToken: token });
});

// Ping (enviar localização)
app.post('/ping', (req,res)=>{
  const auth = req.headers['authorization']||'';
  if(!auth.startsWith('Bearer ')) return res.status(401).json({error:'falta token'});
  const token = auth.slice(7);
  const db = loadDB();
  const device = Object.values(db.devices).find(d => d.token === token);
  if(!device) return res.status(401).json({error:'token inválido'});
  const { lat=null, lng=null, note='' } = req.body || {};
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const rec = { deviceId: device.id, ts: new Date().toISOString(), ip, lat, lng, note };
  db.last[device.id] = rec;
  saveDB(db);
  res.json({ ok:true, ts: rec.ts, deviceId: device.id });
});

// Última localização (JSON)
app.get('/last/:deviceId', (req,res)=>{
  const db = loadDB();
  const rec = db.last[req.params.deviceId];
  if(!rec) return res.status(404).json({error:'sem registros'});
  res.json(rec);
});

// Página simples pra visualizar
app.get('/view/:deviceId', (req,res)=>{
  res.sendFile(path.join(__dirname, 'view.html'));
});

// Página do agente (cliente)
app.get('/agent', (req,res)=>{
  res.sendFile(path.join(__dirname, 'agent.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Servidor simples em http://localhost:'+PORT));
