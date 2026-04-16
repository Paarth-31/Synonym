// // const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
// // const path  = require('path');
// // const fs    = require('fs');
// // const { execFile } = require('child_process');
// // const { Client }   = require('pg');
// // const bcrypt       = require('bcryptjs');

// // // ─── Config ────────────────────────────────────────────────
// // function readConfig() {
// //   const locations = [
// //     path.join(process.resourcesPath || '', 'config.properties'),
// //     path.join(__dirname, '..', 'config.properties'),
// //     path.join(app.getAppPath(), 'config.properties'),
// //   ];
// //   for (const loc of locations) {
// //     if (fs.existsSync(loc)) {
// //       const map = {};
// //       fs.readFileSync(loc, 'utf8').split('\n').forEach(line => {
// //         line = line.trim();
// //         if (!line || line.startsWith('#')) return;
// //         const [k, ...rest] = line.split('=');
// //         if (k) map[k.trim()] = rest.join('=').trim();
// //       });
// //       return map;
// //     }
// //   }
// //   return {};
// // }

// // const cfg = readConfig();
// // const LOGIN_URL = cfg['db.login.url'] || 'postgresql://synonym:password@localhost:5432/synonym_login_db';
// // const FILES_URL = cfg['db.files.url'] || 'postgresql://synonym:password@localhost:5432/synonym_files_db';

// // // ─── DB helpers ────────────────────────────────────────────
// // async function loginDb()  { const c = new Client({ connectionString: LOGIN_URL }); await c.connect(); return c; }
// // async function filesDb()  { const c = new Client({ connectionString: FILES_URL }); await c.connect(); return c; }

// // async function ensureTables() {
// //   try {
// //     const lc = await loginDb();
// //     await lc.query(`
// //       CREATE TABLE IF NOT EXISTS users (
// //         id SERIAL PRIMARY KEY, name VARCHAR(100),
// //         email VARCHAR(100) UNIQUE, username VARCHAR(100) UNIQUE,
// //         password VARCHAR(255), profile_picture TEXT,
// //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// //       );
// //       CREATE TABLE IF NOT EXISTS chat_history (
// //         id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id),
// //         message TEXT, response TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// //       );`);
// //     await lc.end();
// //     const fc = await filesDb();
// //     await fc.query(`
// //       CREATE TABLE IF NOT EXISTS media_files (
// //         id SERIAL PRIMARY KEY, name TEXT UNIQUE, keywords TEXT, summary TEXT,
// //         genre_name TEXT, genre_score DECIMAL(6,4), file_location TEXT,
// //         confidence_score DECIMAL(6,4), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// //       );
// //       CREATE TABLE IF NOT EXISTS file_genres (
// //         id SERIAL PRIMARY KEY,
// //         file_name TEXT REFERENCES media_files(name) ON DELETE CASCADE,
// //         genre_name TEXT, genre_score DECIMAL(6,4)
// //       );
// //       CREATE INDEX IF NOT EXISTS idx_fg_name ON file_genres(file_name);
// //       ALTER TABLE media_files ADD COLUMN IF NOT EXISTS summary TEXT;`);
// //     await fc.end();
// //     console.log('✓ DB tables ready');
// //   } catch (e) {
// //     console.error('DB setup error:', e.message);
// //   }
// // }

// // // ─── Session store ──────────────────────────────────────────
// // let currentSession = null;

// // // ─── Window ────────────────────────────────────────────────
// // function createWindow() {
// //   const win = new BrowserWindow({
// //     width: 1400, height: 860,
// //     minWidth: 1100, minHeight: 680,
// //     frame: true,
// //     webPreferences: {
// //       preload: path.join(__dirname, 'preload.js'),
// //       contextIsolation: true,
// //       nodeIntegration: false,
// //     },
// //   });

// //   if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
// //     win.loadURL('http://localhost:5173');
// //     win.webContents.openDevTools({ mode: 'detach' });
// //   } else {
// //     win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
// //   }
// // }

// // app.whenReady().then(async () => {
// //   await ensureTables();
// //   createWindow();
// // });
// // app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// // // ═══════════════════════════════════════════════════════════
// // //  IPC HANDLERS
// // // ═══════════════════════════════════════════════════════════

// // // ── Auth ──────────────────────────────────────────────────
// // ipcMain.handle('auth:register', async (_, { name, email, username, password }) => {
// //   try {
// //     const hashed = await bcrypt.hash(password, 10);
// //     const c = await loginDb();
// //     await c.query(
// //       'INSERT INTO users (name,email,username,password) VALUES ($1,$2,$3,$4)',
// //       [name, email, username, hashed]
// //     );
// //     await c.end();
// //     return { success: true };
// //   } catch (e) {
// //     const msg = e.message || '';
// //     return { success: false, error: msg.includes('unique') || msg.includes('duplicate')
// //       ? 'Email or username already taken'
// //       : 'Registration failed: ' + msg };
// //   }
// // });

// // ipcMain.handle('auth:login', async (_, { emailOrUsername, password }) => {
// //   try {
// //     const c = await loginDb();
// //     const { rows } = await c.query(
// //       'SELECT * FROM users WHERE email=$1 OR username=$1',
// //       [emailOrUsername]
// //     );
// //     await c.end();
// //     if (!rows.length) return { success: false, error: 'Invalid credentials' };
// //     const ok = await bcrypt.compare(password, rows[0].password);
// //     if (!ok)          return { success: false, error: 'Invalid credentials' };
// //     currentSession = { id: rows[0].id, name: rows[0].name, email: rows[0].email, username: rows[0].username };
// //     return { success: true, data: currentSession };
// //   } catch (e) {
// //     return { success: false, error: 'DB error: ' + e.message };
// //   }
// // });

// // ipcMain.handle('auth:logout',     () => { currentSession = null; return { success: true }; });
// // ipcMain.handle('auth:getSession', () => currentSession);

// // ipcMain.handle('auth:updatePassword', async (_, { email, newPassword }) => {
// //   try {
// //     const hashed = await bcrypt.hash(newPassword, 10);
// //     const c = await loginDb();
// //     const r = await c.query('UPDATE users SET password=$1 WHERE email=$2', [hashed, email]);
// //     await c.end();
// //     return r.rowCount > 0 ? { success: true } : { success: false, error: 'Email not found' };
// //   } catch (e) {
// //     return { success: false, error: e.message };
// //   }
// // });

// // // ── File system ───────────────────────────────────────────
// // ipcMain.handle('fs:homeDir', () => require('os').homedir());

// // ipcMain.handle('fs:listDir', async (_, { dirPath }) => {
// //   try {
// //     if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory())
// //       return { success: false, error: 'Directory not found' };

// //     // Fetch known genres for files in this dir
// //     const genreMap = {};
// //     try {
// //       const c = await filesDb();
// //       const { rows } = await c.query(
// //         'SELECT name, genre_name, genre_score FROM media_files WHERE file_location LIKE $1',
// //         [dirPath + '%']
// //       );
// //       await c.end();
// //       rows.forEach(r => { genreMap[r.name] = { genre: r.genre_name, score: parseFloat(r.genre_score) }; });
// //     } catch (_) {}

// //     const entries = fs.readdirSync(dirPath, { withFileTypes: true }).map(d => {
// //       let size = 0, modified = '';
// //       try {
// //         const st = fs.statSync(path.join(dirPath, d.name));
// //         size = st.size;
// //         modified = st.mtime.toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
// //       } catch (_) {}
// //       const g = genreMap[d.name];
// //       return { name: d.name, path: path.join(dirPath, d.name), isDir: d.isDirectory(),
// //                size, modified, genre: g?.genre || null, genreScore: g?.score || null };
// //     });

// //     entries.sort((a, b) => {
// //       if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
// //       return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
// //     });
// //     return { success: true, data: entries };
// //   } catch (e) {
// //     return { success: false, error: e.message };
// //   }
// // });

// // ipcMain.handle('fs:openFile', async (_, { filePath }) => {
// //   try { await shell.openPath(filePath); return { success: true }; }
// //   catch (e) { return { success: false, error: e.message }; }
// // });

// // ipcMain.handle('fs:showOpenDialog', async (_, opts) => {
// //   const result = await dialog.showOpenDialog(opts);
// //   return result.canceled ? null : result.filePaths;
// // });

// // // ── Analysis ──────────────────────────────────────────────
// // ipcMain.handle('analysis:run', async (_, { filePaths, scriptPath, modelPath }) => {
// //   const results = [];
// //   for (const fp of filePaths) {
// //     try {
// //       const json = await runPython(scriptPath, [fp, modelPath]);
// //       if (json?.success) {
// //         await saveAnalysis(json, fp);
// //         results.push(json);
// //       }
// //     } catch (e) {
// //       console.error('Analysis error for', fp, e.message);
// //     }
// //   }
// //   return { success: true, data: results };
// // });

// // function runPython(script, args) {
// //   return new Promise((resolve, reject) => {
// //     execFile('python3', [script, ...args], { timeout: 300_000 }, (err, stdout, stderr) => {
// //       if (stderr) console.error('[PYTHON]', stderr);
// //       if (err)    { reject(err); return; }
// //       const start = stdout.indexOf('{');
// //       const end   = stdout.lastIndexOf('}');
// //       if (start === -1 || end === -1) { reject(new Error('No JSON in output')); return; }
// //       try { resolve(JSON.parse(stdout.slice(start, end + 1))); }
// //       catch (e) { reject(e); }
// //     });
// //   });
// // }

// // async function saveAnalysis(result, filePath) {
// //   const c = await filesDb();
// //   const keywords = Object.keys(result.keywords || {}).slice(0, 50).join(', ');
// //   await c.query(
// //     `INSERT INTO media_files (name,keywords,summary,genre_name,genre_score,file_location,confidence_score)
// //      VALUES ($1,$2,$3,$4,$5,$6,$7)
// //      ON CONFLICT (name) DO UPDATE SET
// //        keywords=EXCLUDED.keywords, summary=EXCLUDED.summary,
// //        genre_name=EXCLUDED.genre_name, genre_score=EXCLUDED.genre_score,
// //        file_location=EXCLUDED.file_location, confidence_score=EXCLUDED.confidence_score`,
// //     [result.filename, keywords, result.summary||'', result.top_genre,
// //      result.confidence, filePath, result.confidence]
// //   );
// //   await c.query('DELETE FROM file_genres WHERE file_name=$1', [result.filename]);
// //   const genres = result.genres || {};
// //   for (const [genre, score] of Object.entries(genres)) {
// //     if (score >= 0.05) {
// //       await c.query('INSERT INTO file_genres (file_name,genre_name,genre_score) VALUES ($1,$2,$3)',
// //         [result.filename, genre, score]);
// //     }
// //   }
// //   await c.end();
// // }

// // // ── DB queries ────────────────────────────────────────────
// // ipcMain.handle('db:getFileDetail', async (_, { filename }) => {
// //   try {
// //     const c = await filesDb();
// //     const { rows } = await c.query(
// //       'SELECT * FROM media_files WHERE name=$1', [filename]);
// //     if (!rows.length) { await c.end(); return { success: false, error: 'Not analyzed yet' }; }
// //     const r = rows[0];
// //     const { rows: genres } = await c.query(
// //       'SELECT genre_name, genre_score FROM file_genres WHERE file_name=$1 AND genre_score>=0.08 ORDER BY genre_score DESC',
// //       [filename]);
// //     await c.end();
// //     return { success: true, data: {
// //       name: r.name, path: r.file_location,
// //       topGenre: r.genre_name, genreScore: parseFloat(r.genre_score),
// //       confidence: parseFloat(r.confidence_score),
// //       keywords: r.keywords || '', summary: r.summary || '',
// //       allGenres: genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
// //     }};
// //   } catch (e) { return { success: false, error: e.message }; }
// // });

// // ipcMain.handle('db:search', async (_, { query }) => {
// //   try {
// //     const c = await filesDb();
// //     const pat = `%${query.toLowerCase()}%`;
// //     const { rows } = await c.query(
// //       `SELECT name, file_location, genre_name, genre_score, confidence_score, keywords, summary
// //        FROM media_files
// //        WHERE LOWER(name) LIKE $1 OR LOWER(keywords) LIKE $1 OR LOWER(genre_name) LIKE $1
// //        ORDER BY confidence_score DESC LIMIT 50`,
// //       [pat]);
// //     await c.end();
// //     return { success: true, data: rows.map(r => ({
// //       name: r.name, path: r.file_location, topGenre: r.genre_name,
// //       genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
// //       keywords: r.keywords || '', summary: r.summary || '', allGenres: [],
// //     }))};
// //   } catch (e) { return { success: false, error: e.message }; }
// // });

// // ipcMain.handle('db:getAllAnalyzed', async () => {
// //   try {
// //     const c = await filesDb();
// //     const { rows } = await c.query(
// //       'SELECT name, file_location, genre_name, genre_score, confidence_score, keywords, summary FROM media_files ORDER BY created_at DESC'
// //     );
// //     const results = [];
// //     for (const r of rows) {
// //       const { rows: genres } = await c.query(
// //         'SELECT genre_name, genre_score FROM file_genres WHERE file_name=$1 ORDER BY genre_score DESC',
// //         [r.name]);
// //       results.push({
// //         name: r.name, path: r.file_location, topGenre: r.genre_name,
// //         genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
// //         keywords: r.keywords || '', summary: r.summary || '',
// //         allGenres: genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
// //       });
// //     }
// //     await c.end();
// //     return { success: true, data: results };
// //   } catch (e) { return { success: false, error: e.message }; }
// // });





// const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
// const path       = require('path');
// const fs         = require('fs');
// const os         = require('os');
// const { execFile } = require('child_process');
// const { Client }   = require('pg');

// // ─── Config ─────────────────────────────────────────────────
// function readConfig() {
//   const locations = [
//     path.join(process.resourcesPath || '', 'config.properties'),
//     path.join(__dirname, '..', 'config.properties'),
//     path.join(app.getAppPath?.() || '', 'config.properties'),
//   ];
//   for (const loc of locations) {
//     if (fs.existsSync(loc)) {
//       const map = {};
//       fs.readFileSync(loc, 'utf8').split('\n').forEach(line => {
//         line = line.trim();
//         if (!line || line.startsWith('#')) return;
//         const [k, ...rest] = line.split('=');
//         if (k) map[k.trim()] = rest.join('=').trim();
//       });
//       return map;
//     }
//   }
//   return {};
// }

// const cfg       = readConfig();
// const FILES_URL = cfg['db.files.url'] || 'postgresql://synonym:password@localhost:5432/synonym_files_db';

// // ─── Python script paths ─────────────────────────────────────
// // Resolve absolute paths so they work regardless of CWD.
// // In dev:  <project_root>/python/
// // In prod: <resources>/python/
// function getPythonPaths() {
//   const base = app.isPackaged
//     ? path.join(process.resourcesPath, 'python')
//     : path.join(__dirname, '..', 'python');
//   return {
//     script: path.join(base, 'firstrun.py'),
//     model:  path.join(base, 'genre_classifier.pkl'),
//   };
// }

// // ─── DB helpers ──────────────────────────────────────────────
// async function filesDb() {
//   const c = new Client({ connectionString: FILES_URL });
//   await c.connect();
//   return c;
// }

// async function ensureTables() {
//   try {
//     const c = await filesDb();
//     await c.query(`
//       CREATE TABLE IF NOT EXISTS media_files (
//         id SERIAL PRIMARY KEY, name TEXT UNIQUE, keywords TEXT, summary TEXT,
//         genre_name TEXT, genre_score DECIMAL(6,4), file_location TEXT,
//         confidence_score DECIMAL(6,4), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//       CREATE TABLE IF NOT EXISTS file_genres (
//         id SERIAL PRIMARY KEY,
//         file_name TEXT REFERENCES media_files(name) ON DELETE CASCADE,
//         genre_name TEXT, genre_score DECIMAL(6,4)
//       );
//       CREATE INDEX IF NOT EXISTS idx_fg_name ON file_genres(file_name);
//     `);
//     // Add summary column if upgrading from older schema
//     await c.query(`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS summary TEXT;`);
//     await c.end();
//     console.log('✓ DB tables ready');
//   } catch (e) {
//     console.error('DB setup error:', e.message);
//   }
// }

// // ─── Window ──────────────────────────────────────────────────
// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1400, height: 860,
//     minWidth: 1100, minHeight: 680,
//     backgroundColor: '#07080a',
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   if (!app.isPackaged) {
//     win.loadURL('http://localhost:5173');
//     win.webContents.openDevTools({ mode: 'detach' });
//   } else {
//     win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
//   }
// }

// app.whenReady().then(async () => {
//   await ensureTables();
//   createWindow();
// });
// app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// // ═══════════════════════════════════════════════════════════
// //  IPC HANDLERS
// // ═══════════════════════════════════════════════════════════

// // ── File system ───────────────────────────────────────────
// ipcMain.handle('fs:homeDir', () => os.homedir());

// // Detect accessible drives/roots — works on WSL, Linux, Windows
// ipcMain.handle('fs:getDrives', async () => {
//   const drives = [];

//   // Always add home
//   drives.push({ label: 'Home', path: os.homedir() });

//   // Linux / WSL: scan /mnt for Windows drives (C:, D:, etc.)
//   const mnt = '/mnt';
//   if (fs.existsSync(mnt)) {
//     try {
//       fs.readdirSync(mnt).forEach(d => {
//         const full = path.join(mnt, d);
//         // Single letters = Windows drive letters (C, D, E...)
//         if (d.length === 1 && /[a-z]/i.test(d)) {
//           try {
//             fs.readdirSync(full); // test accessibility
//             drives.push({ label: `${d.toUpperCase()}:\\ (Windows)`, path: full });
//           } catch (_) {}
//         }
//       });
//     } catch (_) {}
//   }

//   // Native Windows: enumerate drive letters
//   if (process.platform === 'win32') {
//     for (let i = 67; i <= 90; i++) { // C–Z
//       const d = String.fromCharCode(i) + ':\\';
//       try { fs.readdirSync(d); drives.push({ label: d, path: d }); } catch (_) {}
//     }
//   }

//   // Also add filesystem root
//   if (process.platform !== 'win32') {
//     drives.push({ label: '/ (Root)', path: '/' });
//   }

//   return drives;
// });

// ipcMain.handle('fs:listDir', async (_, { dirPath }) => {
//   try {
//     if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory())
//       return { success: false, error: 'Directory not found: ' + dirPath };

//     // Fetch known genres for files in this dir from DB
//     const genreMap = {};
//     try {
//       const c = await filesDb();
//       const { rows } = await c.query(
//         'SELECT name, genre_name, genre_score FROM media_files WHERE file_location LIKE $1',
//         [dirPath.replace(/\\/g, '/') + '%']
//       );
//       await c.end();
//       rows.forEach(r => {
//         genreMap[r.name] = { genre: r.genre_name, score: parseFloat(r.genre_score) };
//       });
//     } catch (_) {}

//     const entries = fs.readdirSync(dirPath, { withFileTypes: true }).map(d => {
//       let size = 0, modified = '';
//       try {
//         const st = fs.statSync(path.join(dirPath, d.name));
//         size     = st.size;
//         modified = st.mtime.toLocaleDateString('en-US', {
//           month:'short', day:'2-digit', year:'numeric',
//           hour:'2-digit', minute:'2-digit'
//         });
//       } catch (_) {}
//       const g = genreMap[d.name];
//       return {
//         name: d.name,
//         path: path.join(dirPath, d.name),
//         isDir: d.isDirectory(),
//         size, modified,
//         genre:      g?.genre || null,
//         genreScore: g?.score || null,
//       };
//     });

//     entries.sort((a, b) => {
//       if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
//       return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
//     });
//     return { success: true, data: entries };
//   } catch (e) {
//     return { success: false, error: e.message };
//   }
// });

// ipcMain.handle('fs:openFile', async (_, { filePath }) => {
//   try { await shell.openPath(filePath); return { success: true }; }
//   catch (e) { return { success: false, error: e.message }; }
// });

// ipcMain.handle('fs:showOpenDialog', async (_, opts) => {
//   const result = await dialog.showOpenDialog(opts);
//   return result.canceled ? null : result.filePaths;
// });

// // ── Analysis ──────────────────────────────────────────────
// ipcMain.handle('analysis:run', async (_, { filePaths }) => {
//   // FIX: resolve paths absolutely here in main process — never trust renderer paths
//   const { script, model } = getPythonPaths();

//   console.log('[Analysis] Script:', script);
//   console.log('[Analysis] Model: ', model);
//   console.log('[Analysis] Files: ', filePaths);

//   if (!fs.existsSync(script)) {
//     return { success: false, error: `Python script not found at: ${script}` };
//   }
//   if (!fs.existsSync(model)) {
//     return { success: false, error: `Model not found at: ${model}` };
//   }

//   const results = [];
//   for (const fp of filePaths) {
//     try {
//       console.log('[Analysis] Processing:', fp);
//       const json = await runPython(script, [fp, model]);
//       if (json?.success) {
//         await saveAnalysis(json, fp);
//         results.push(json);
//         console.log('[Analysis] ✓ Saved:', json.filename);
//       } else {
//         console.error('[Analysis] Script error:', json?.error);
//       }
//     } catch (e) {
//       console.error('[Analysis] Exception for', fp, ':', e.message);
//     }
//   }
//   return { success: true, data: results };
// });

// function runPython(script, args) {
//   return new Promise((resolve, reject) => {
//     execFile('python3', [script, ...args], { timeout: 600_000 }, (err, stdout, stderr) => {
//       if (stderr) console.error('[PYTHON STDERR]', stderr);
//       if (err) { reject(new Error(`Python failed: ${err.message}`)); return; }

//       const start = stdout.indexOf('{');
//       const end   = stdout.lastIndexOf('}');
//       if (start === -1 || end === -1) {
//         console.error('[PYTHON] stdout:', stdout.slice(0, 500));
//         reject(new Error('No JSON found in Python output'));
//         return;
//       }
//       try {
//         resolve(JSON.parse(stdout.slice(start, end + 1)));
//       } catch (e) {
//         reject(new Error('Failed to parse Python JSON: ' + e.message));
//       }
//     });
//   });
// }

// async function saveAnalysis(result, filePath) {
//   const c = await filesDb();
//   try {
//     const keywords = Object.keys(result.keywords || {}).slice(0, 50).join(', ');
//     const summary  = (result.summary || '').slice(0, 2000);

//     await c.query(
//       `INSERT INTO media_files
//          (name, keywords, summary, genre_name, genre_score, file_location, confidence_score)
//        VALUES ($1,$2,$3,$4,$5,$6,$7)
//        ON CONFLICT (name) DO UPDATE SET
//          keywords         = EXCLUDED.keywords,
//          summary          = EXCLUDED.summary,
//          genre_name       = EXCLUDED.genre_name,
//          genre_score      = EXCLUDED.genre_score,
//          file_location    = EXCLUDED.file_location,
//          confidence_score = EXCLUDED.confidence_score`,
//       [
//         result.filename,
//         keywords,
//         summary,
//         result.top_genre,
//         result.confidence,
//         filePath,
//         result.confidence,
//       ]
//     );

//     // Replace all genre scores for this file
//     await c.query('DELETE FROM file_genres WHERE file_name=$1', [result.filename]);
//     const genres = result.genres || {};
//     for (const [genre, score] of Object.entries(genres)) {
//       if (score >= 0.05) {
//         await c.query(
//           'INSERT INTO file_genres (file_name,genre_name,genre_score) VALUES ($1,$2,$3)',
//           [result.filename, genre, score]
//         );
//       }
//     }
//     console.log('[DB] Saved analysis for:', result.filename, '| genre:', result.top_genre);
//   } finally {
//     await c.end();
//   }
// }

// // ── DB queries ────────────────────────────────────────────
// ipcMain.handle('db:getFileDetail', async (_, { filename }) => {
//   try {
//     const c = await filesDb();
//     const { rows } = await c.query('SELECT * FROM media_files WHERE name=$1', [filename]);
//     if (!rows.length) { await c.end(); return { success: false, error: 'Not analyzed yet' }; }
//     const r = rows[0];
//     const { rows: genres } = await c.query(
//       'SELECT genre_name, genre_score FROM file_genres WHERE file_name=$1 AND genre_score>=0.08 ORDER BY genre_score DESC',
//       [filename]
//     );
//     await c.end();
//     return { success: true, data: {
//       name:       r.name,
//       path:       r.file_location,
//       topGenre:   r.genre_name,
//       genreScore: parseFloat(r.genre_score),
//       confidence: parseFloat(r.confidence_score),
//       keywords:   r.keywords || '',
//       summary:    r.summary  || '',
//       allGenres:  genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
//     }};
//   } catch (e) { return { success: false, error: e.message }; }
// });

// ipcMain.handle('db:search', async (_, { query }) => {
//   try {
//     const c   = await filesDb();
//     const pat = `%${query.toLowerCase()}%`;
//     const { rows } = await c.query(
//       `SELECT name, file_location, genre_name, genre_score, confidence_score, keywords, summary
//        FROM media_files
//        WHERE LOWER(name) LIKE $1 OR LOWER(keywords) LIKE $1 OR LOWER(genre_name) LIKE $1
//        ORDER BY confidence_score DESC LIMIT 50`,
//       [pat]
//     );
//     await c.end();
//     return { success: true, data: rows.map(r => ({
//       name: r.name, path: r.file_location, topGenre: r.genre_name,
//       genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
//       keywords: r.keywords || '', summary: r.summary || '', allGenres: [],
//     }))};
//   } catch (e) { return { success: false, error: e.message }; }
// });

// ipcMain.handle('db:getAllAnalyzed', async () => {
//   try {
//     const c = await filesDb();
//     const { rows } = await c.query(
//       'SELECT name, file_location, genre_name, genre_score, confidence_score, keywords, summary FROM media_files ORDER BY created_at DESC'
//     );
//     const results = [];
//     for (const r of rows) {
//       const { rows: genres } = await c.query(
//         'SELECT genre_name, genre_score FROM file_genres WHERE file_name=$1 ORDER BY genre_score DESC',
//         [r.name]
//       );
//       results.push({
//         name: r.name, path: r.file_location, topGenre: r.genre_name,
//         genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
//         keywords: r.keywords || '', summary: r.summary || '',
//         allGenres: genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
//       });
//     }
//     await c.end();
//     return { success: true, data: results };
//   } catch (e) { return { success: false, error: e.message }; }
// });



const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path             = require('path');
const fs               = require('fs');
const os               = require('os');
const { execFile, execSync } = require('child_process');
const { Client }       = require('pg');

// ─── Config ─────────────────────────────────────────────────
function readConfig() {
  const locations = [
    path.join(process.resourcesPath || '', 'config.properties'),
    path.join(__dirname, '..', 'config.properties'),
  ];
  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      const map = {};
      fs.readFileSync(loc, 'utf8').split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const [k, ...rest] = line.split('=');
        if (k) map[k.trim()] = rest.join('=').trim();
      });
      return map;
    }
  }
  return {};
}

const cfg       = readConfig();
const FILES_URL = cfg['db.files.url'] || 'postgresql://synonym:password@localhost:5432/synonym_files_db';

// ─── Platform detection ──────────────────────────────────────
const IS_WIN   = process.platform === 'win32';
const IS_MAC   = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

function detectWSL() {
  if (!IS_LINUX) return false;
  try {
    const ver = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (ver.includes('microsoft') || ver.includes('wsl')) return true;
  } catch (_) {}
  // Fallback: C drive mounted at /mnt/c is a strong WSL indicator
  return fs.existsSync('/mnt/c');
}
const IS_WSL = detectWSL();

console.log(`[Platform] win=${IS_WIN} mac=${IS_MAC} linux=${IS_LINUX} wsl=${IS_WSL}`);

// ─── Path helpers ────────────────────────────────────────────

// Convert Windows path C:\foo\bar → /mnt/c/foo/bar for WSL
function winToWsl(winPath) {
  return winPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, l) => `/mnt/${l.toLowerCase()}`);
}

// Get Windows user home path accessible from WSL (/mnt/c/Users/username)
function getWinHomeInWSL() {
  // Method 1: ask cmd.exe for USERPROFILE
  try {
    const raw = execSync('cmd.exe /c echo %USERPROFILE%', { timeout: 4000 })
      .toString().trim().replace(/\r/g, '');
    if (raw && raw !== '%USERPROFILE%' && raw.length > 3) {
      const wsl = winToWsl(raw);
      if (fs.existsSync(wsl)) return wsl;
    }
  } catch (_) {}

  // Method 2: wslpath utility (WSL2 usually has it)
  try {
    const win = execSync('wslpath -u "$(cmd.exe /c echo %USERPROFILE%)"', { timeout: 4000 })
      .toString().trim();
    if (win && fs.existsSync(win)) return win;
  } catch (_) {}

  // Method 3: scan /mnt/c/Users for real user folders
  try {
    const skip = new Set(['Public', 'Default', 'Default User', 'All Users', 'desktop.ini']);
    const users = fs.readdirSync('/mnt/c/Users').filter(u => !skip.has(u));
    if (users.length === 1) return `/mnt/c/Users/${users[0]}`;
    // Prefer folder that matches current WSL username
    const me = os.userInfo().username;
    const match = users.find(u => u.toLowerCase() === me.toLowerCase());
    if (match) return `/mnt/c/Users/${match}`;
    if (users.length) return `/mnt/c/Users/${users[0]}`;
  } catch (_) {}

  return null;
}

// ─── Python script paths ─────────────────────────────────────
function getPythonPaths() {
  const base = app.isPackaged
    ? path.join(process.resourcesPath, 'python')
    : path.join(__dirname, '..', 'python');
  return {
    script: path.join(base, 'firstrun.py'),
    model:  path.join(base, 'genre_classifier.pkl'),
  };
}

// ─── DB helpers ──────────────────────────────────────────────
async function filesDb() {
  const c = new Client({ connectionString: FILES_URL });
  await c.connect();
  return c;
}

async function ensureTables() {
  try {
    const c = await filesDb();
    await c.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id SERIAL PRIMARY KEY, name TEXT UNIQUE, keywords TEXT, summary TEXT,
        genre_name TEXT, genre_score DECIMAL(6,4), file_location TEXT,
        confidence_score DECIMAL(6,4), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS file_genres (
        id SERIAL PRIMARY KEY,
        file_name TEXT REFERENCES media_files(name) ON DELETE CASCADE,
        genre_name TEXT, genre_score DECIMAL(6,4)
      );
      CREATE INDEX IF NOT EXISTS idx_fg_name ON file_genres(file_name);
    `);
    await c.query(`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS summary TEXT;`);
    await c.end();
    console.log('✓ DB tables ready');
  } catch (e) {
    console.error('DB setup error:', e.message);
  }
}

// ─── Window ──────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 860,
    minWidth: 1100, minHeight: 680,
    backgroundColor: '#07080a',
    // macOS: hide default traffic-light buttons from titlebar area
    titleBarStyle: IS_MAC ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
  return win;
}

app.whenReady().then(async () => {
  await ensureTables();
  createWindow();
  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => { if (!IS_MAC) app.quit(); });

// ═══════════════════════════════════════════════════════════
//  IPC — FILESYSTEM
// ═══════════════════════════════════════════════════════════

ipcMain.handle('fs:platform', () => ({ isWin: IS_WIN, isMac: IS_MAC, isLinux: IS_LINUX, isWSL: IS_WSL }));
ipcMain.handle('fs:homeDir',  () => os.homedir());

// Returns the Windows home dir path as seen from WSL (null on non-WSL)
ipcMain.handle('fs:windowsHome', () => IS_WSL ? getWinHomeInWSL() : null);

// ── Drive / location enumeration ──────────────────────────
ipcMain.handle('fs:getDrives', async () => {
  const drives = [];

  // ── WSL ────────────────────────────────────────────────
  if (IS_WSL) {
    const wslHome = os.homedir();
    const winHome = getWinHomeInWSL();

    drives.push({ label: 'WSL Home',     path: wslHome, icon: 'home'     });
    if (winHome) {
      drives.push({ label: 'Windows Home', path: winHome, icon: 'win-home' });
      // Common Windows user folders
      for (const [name, sub] of [['Desktop','Desktop'],['Documents','Documents'],['Downloads','Downloads'],['Pictures','Pictures']]) {
        const p = path.join(winHome, sub);
        if (fs.existsSync(p)) drives.push({ label: name, path: p, icon: 'folder' });
      }
    }

    // Mounted Windows drives at /mnt/X
    try {
      fs.readdirSync('/mnt').sort().forEach(d => {
        if (d.length !== 1 || !/[a-z]/.test(d)) return;
        const mntPath = `/mnt/${d}`;
        try {
          fs.readdirSync(mntPath);
          drives.push({ label: `${d.toUpperCase()}:\\ (Windows)`, path: mntPath, icon: 'drive' });
        } catch (_) {}
      });
    } catch (_) {}

    drives.push({ label: '/ (WSL Root)', path: '/', icon: 'root' });
    return drives;
  }

  // ── Native Windows ─────────────────────────────────────
  if (IS_WIN) {
    drives.push({ label: 'Home',      path: os.homedir(), icon: 'home' });
    drives.push({ label: 'Desktop',   path: path.join(os.homedir(),'Desktop'),   icon: 'folder' });
    drives.push({ label: 'Documents', path: path.join(os.homedir(),'Documents'), icon: 'folder' });
    drives.push({ label: 'Downloads', path: path.join(os.homedir(),'Downloads'), icon: 'folder' });
    for (let i = 67; i <= 90; i++) {
      const d = String.fromCharCode(i) + ':\\';
      try { fs.readdirSync(d); drives.push({ label: d, path: d, icon: 'drive' }); } catch (_) {}
    }
    return drives;
  }

  // ── macOS ──────────────────────────────────────────────
  if (IS_MAC) {
    drives.push({ label: 'Home',      path: os.homedir(),                          icon: 'home'   });
    drives.push({ label: 'Desktop',   path: path.join(os.homedir(),'Desktop'),     icon: 'folder' });
    drives.push({ label: 'Documents', path: path.join(os.homedir(),'Documents'),   icon: 'folder' });
    drives.push({ label: 'Downloads', path: path.join(os.homedir(),'Downloads'),   icon: 'folder' });
    drives.push({ label: 'iCloud',    path: path.join(os.homedir(),'Library/Mobile Documents/com~apple~CloudDocs'), icon: 'cloud' });
    drives.push({ label: '/ (Macintosh HD)', path: '/', icon: 'root' });
    try {
      fs.readdirSync('/Volumes').forEach(v => {
        if (v === 'Macintosh HD') return;
        const vp = `/Volumes/${v}`;
        try { fs.readdirSync(vp); drives.push({ label: `${v}`, path: vp, icon: 'drive' }); } catch (_) {}
      });
    } catch (_) {}
    return drives;
  }

  // ── Linux ──────────────────────────────────────────────
  drives.push({ label: 'Home', path: os.homedir(), icon: 'home' });
  drives.push({ label: '/ (Root)', path: '/', icon: 'root' });
  for (const mp of ['/media', '/mnt', '/run/media']) {
    if (!fs.existsSync(mp)) continue;
    try {
      fs.readdirSync(mp).forEach(d => {
        const full = path.join(mp, d);
        try { if (fs.statSync(full).isDirectory()) drives.push({ label: d, path: full, icon: 'drive' }); } catch (_) {}
      });
    } catch (_) {}
  }
  return drives;
});

// ── List directory ────────────────────────────────────────
ipcMain.handle('fs:listDir', async (_, { dirPath }) => {
  // Normalize all backslashes → forward slashes
  let resolved = dirPath.replace(/\\/g, '/');

  // If a Windows-style path is passed in WSL, convert it
  if (IS_WSL && /^[A-Za-z]:/.test(dirPath)) {
    resolved = winToWsl(dirPath);
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    return { success: false, error: `Directory not found: ${resolved}` };
  }

  try {
    const genreMap = {};
    try {
      const c = await filesDb();
      const { rows } = await c.query(
        'SELECT name, genre_name, genre_score FROM media_files WHERE file_location LIKE $1',
        [resolved + '%']
      );
      await c.end();
      rows.forEach(r => { genreMap[r.name] = { genre: r.genre_name, score: parseFloat(r.genre_score) }; });
    } catch (_) {}

    const entries = fs.readdirSync(resolved, { withFileTypes: true })
      .filter(d => IS_WIN || !d.name.startsWith('.'))   // hide dotfiles on unix
      .map(d => {
        let size = 0, modified = '';
        try {
          const st = fs.statSync(path.join(resolved, d.name));
          size     = st.size;
          modified = st.mtime.toLocaleDateString('en-US', {
            month:'short', day:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
          });
        } catch (_) {}
        const g = genreMap[d.name];
        return { name: d.name, path: path.join(resolved, d.name), isDir: d.isDirectory(),
                 size, modified, genre: g?.genre||null, genreScore: g?.score||null };
      });

    entries.sort((a, b) => (a.isDir === b.isDir ? 0 : a.isDir ? -1 : 1) ||
                            a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    return { success: true, data: entries };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ── Open file natively ────────────────────────────────────
ipcMain.handle('fs:openFile', async (_, { filePath }) => {
  try {
    if (IS_WSL) {
      // Try to open with Windows app via wslpath
      try {
        const winPath = execSync(`wslpath -w "${filePath}"`, { timeout: 3000 }).toString().trim();
        execSync(`cmd.exe /c start "" "${winPath}"`, { timeout: 5000 });
        return { success: true };
      } catch (_) {
        // Fallback: xdg-open
        execSync(`xdg-open "${filePath}"`, { timeout: 5000 });
        return { success: true };
      }
    }
    await shell.openPath(filePath);
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

// ── Open file picker dialog ───────────────────────────────
ipcMain.handle('fs:showOpenDialog', async (_, opts) => {
  // Choose a sensible default open location
  let defaultPath = os.homedir();
  if (IS_WSL) {
    const winHome = getWinHomeInWSL();
    if (winHome && fs.existsSync(winHome)) defaultPath = winHome;
  }
  const result = await dialog.showOpenDialog({ defaultPath, ...opts });
  return result.canceled ? null : result.filePaths;
});

// ═══════════════════════════════════════════════════════════
//  IPC — ANALYSIS
// ═══════════════════════════════════════════════════════════

ipcMain.handle('analysis:run', async (_, { filePaths }) => {
  const { script, model } = getPythonPaths();
  if (!fs.existsSync(script)) return { success: false, error: `Script not found: ${script}` };
  if (!fs.existsSync(model))  return { success: false, error: `Model not found: ${model}` };

  const results = [];
  for (const fp of filePaths) {
    try {
      const json = await runPython(script, [fp, model]);
      if (json?.success) { await saveAnalysis(json, fp); results.push(json); }
      else console.error('[Analysis] Error:', json?.error);
    } catch (e) { console.error('[Analysis]', fp, e.message); }
  }
  return { success: true, data: results };
});

function runPython(script, args) {
  const cmd = IS_WIN ? 'python' : 'python3';
  return new Promise((resolve, reject) => {
    execFile(cmd, [script, ...args], { timeout: 600_000 }, (err, stdout, stderr) => {
      if (stderr) console.error('[PYTHON]', stderr);
      if (err) { reject(new Error(err.message)); return; }
      const s = stdout.indexOf('{'), e = stdout.lastIndexOf('}');
      if (s === -1 || e === -1) { reject(new Error('No JSON in output')); return; }
      try { resolve(JSON.parse(stdout.slice(s, e + 1))); }
      catch (ex) { reject(ex); }
    });
  });
}

async function saveAnalysis(result, filePath) {
  const c = await filesDb();
  try {
    await c.query(
      `INSERT INTO media_files (name,keywords,summary,genre_name,genre_score,file_location,confidence_score)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (name) DO UPDATE SET
         keywords=EXCLUDED.keywords, summary=EXCLUDED.summary,
         genre_name=EXCLUDED.genre_name, genre_score=EXCLUDED.genre_score,
         file_location=EXCLUDED.file_location, confidence_score=EXCLUDED.confidence_score`,
      [result.filename, Object.keys(result.keywords||{}).slice(0,50).join(', '),
       (result.summary||'').slice(0,2000), result.top_genre,
       result.confidence, filePath, result.confidence]
    );
    await c.query('DELETE FROM file_genres WHERE file_name=$1', [result.filename]);
    for (const [g, sc] of Object.entries(result.genres||{})) {
      if (sc >= 0.05) await c.query(
        'INSERT INTO file_genres (file_name,genre_name,genre_score) VALUES ($1,$2,$3)',
        [result.filename, g, sc]
      );
    }
    console.log('[DB] ✓ Saved:', result.filename, '|', result.top_genre);
  } finally { await c.end(); }
}

// ═══════════════════════════════════════════════════════════
//  IPC — DB QUERIES
// ═══════════════════════════════════════════════════════════

ipcMain.handle('db:getFileDetail', async (_, { filename }) => {
  try {
    const c = await filesDb();
    const { rows } = await c.query('SELECT * FROM media_files WHERE name=$1', [filename]);
    if (!rows.length) { await c.end(); return { success: false, error: 'Not analyzed yet' }; }
    const r = rows[0];
    const { rows: genres } = await c.query(
      'SELECT genre_name, genre_score FROM file_genres WHERE file_name=$1 AND genre_score>=0.08 ORDER BY genre_score DESC',
      [filename]
    );
    await c.end();
    return { success: true, data: {
      name: r.name, path: r.file_location,
      topGenre: r.genre_name, genreScore: parseFloat(r.genre_score),
      confidence: parseFloat(r.confidence_score),
      keywords: r.keywords||'', summary: r.summary||'',
      allGenres: genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
    }};
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('db:search', async (_, { query }) => {
  try {
    const c = await filesDb();
    const pat = `%${query.toLowerCase()}%`;
    const { rows } = await c.query(
      `SELECT name,file_location,genre_name,genre_score,confidence_score,keywords,summary
       FROM media_files WHERE LOWER(name) LIKE $1 OR LOWER(keywords) LIKE $1 OR LOWER(genre_name) LIKE $1
       ORDER BY confidence_score DESC LIMIT 50`, [pat]
    );
    await c.end();
    return { success: true, data: rows.map(r => ({
      name: r.name, path: r.file_location, topGenre: r.genre_name,
      genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
      keywords: r.keywords||'', summary: r.summary||'', allGenres: [],
    }))};
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('db:getAllAnalyzed', async () => {
  try {
    const c = await filesDb();
    const { rows } = await c.query(
      'SELECT name,file_location,genre_name,genre_score,confidence_score,keywords,summary FROM media_files ORDER BY created_at DESC'
    );
    const results = [];
    for (const r of rows) {
      const { rows: genres } = await c.query(
        'SELECT genre_name,genre_score FROM file_genres WHERE file_name=$1 ORDER BY genre_score DESC', [r.name]
      );
      results.push({
        name: r.name, path: r.file_location, topGenre: r.genre_name,
        genreScore: parseFloat(r.genre_score), confidence: parseFloat(r.confidence_score),
        keywords: r.keywords||'', summary: r.summary||'',
        allGenres: genres.map(g => ({ genre: g.genre_name, score: parseFloat(g.genre_score) })),
      });
    }
    await c.end();
    return { success: true, data: results };
  } catch (e) { return { success: false, error: e.message }; }
});