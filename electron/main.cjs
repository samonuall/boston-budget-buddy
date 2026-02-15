const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let db;
let mainWindow;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'budget.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Insert default settings if they don't exist
  const insertDefault = db.prepare(
    'INSERT OR IGNORE INTO user_settings (key, value) VALUES (?, ?)'
  );

  const defaults = {
    gross_salary: '75000',
    bonus: '7000',
    four01k_percent: '10',
    onboarding_complete: 'false',
    category_budgets: JSON.stringify({
      rent: 3000,
      food: 450,
      gym: 50,
      roth_ira: 583,
      fun: 120,
      social: 150,
      utilities: 200,
      transportation: 90,
      renters_insurance: 30,
      personal_care: 60,
      savings: 500,
    }),
  };

  for (const [key, value] of Object.entries(defaults)) {
    insertDefault.run(key, value);
  }
}

function setupIpcHandlers() {
  // Settings
  ipcMain.handle('get-setting', (_, key) => {
    const row = db.prepare('SELECT value FROM user_settings WHERE key = ?').get(key);
    return row ? row.value : null;
  });

  ipcMain.handle('set-setting', (_, key, value) => {
    db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(key, value);
    return true;
  });

  ipcMain.handle('get-all-settings', () => {
    const rows = db.prepare('SELECT key, value FROM user_settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  });

  // Expenses
  ipcMain.handle('add-expense', (_, expense) => {
    db.prepare(
      'INSERT INTO expenses (id, amount, category, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(expense.id, expense.amount, expense.category, expense.note || null, expense.date, expense.created_at || new Date().toISOString());
    return true;
  });

  ipcMain.handle('get-expenses', (_, month, year) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    return db.prepare(
      'SELECT * FROM expenses WHERE date >= ? AND date < ? ORDER BY date DESC, created_at DESC'
    ).all(startDate, endDate);
  });

  ipcMain.handle('delete-expense', (_, id) => {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('update-expense', (_, expense) => {
    db.prepare(
      'UPDATE expenses SET amount = ?, category = ?, note = ?, date = ? WHERE id = ?'
    ).run(expense.amount, expense.category, expense.note || null, expense.date, expense.id);
    return true;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#faf8f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
