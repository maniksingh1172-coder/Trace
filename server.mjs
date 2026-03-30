import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Path to SQLite database
const dataDir = process.env.NODE_ENV === 'production' ? path.join(process.cwd(), 'data') : process.cwd();
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'database.sqlite');

const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json({ limit: '500mb' }));

// Serve static frontend files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.post('/api/save', (req, res) => {
  try {
    let id = req.body.id;
    if (id && typeof id === 'string') {
        id = id.replace(/[^a-zA-Z0-9_-]/g, '');
    }
    
    // Check if the id was "null"
    const workspaceId = (id && id.length > 0 && id !== 'null') ? id : crypto.randomBytes(8).toString('hex');
    const dataToSave = req.body.data;
    
    if (!dataToSave) {
        console.error("[SAVE] Error: req.body.data is missing");
        return res.status(400).json({ error: 'Data is missing' });
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO workspaces (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    stmt.run(workspaceId, JSON.stringify(dataToSave));
    
    console.log(`[SAVE] Successfully saved workspace ${workspaceId} to database.`);
    res.json({ success: true, id: workspaceId });
  } catch (err) {
    console.error(`[SAVE] CRITICAL ERROR:`, err.name, err.message);
    res.status(500).json({ error: 'Failed to save workspace', message: err.message, stack: err.stack });
  }
});

app.get('/api/load/:id', (req, res) => {
  try {
    const id = req.params.id;
    
    const stmt = db.prepare('SELECT data FROM workspaces WHERE id = ?');
    const row = stmt.get(id);

    if (!row) {
      return res.status(404).json({ error: 'Save not found' });
    }

    console.log(`[LOAD] Loading workspace ${id} from database.`);
    res.setHeader('Content-Type', 'application/json');
    res.send(row.data);
  } catch (err) {
    console.error(`[LOAD] Error loading workspace:`, err);
    res.status(500).json({ error: 'Failed to load workspace', message: err.message });
  }
});

// Fallback all other routes to React router
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
process.on('SIGTERM', () => {
  db.close();
  process.exit();
});
