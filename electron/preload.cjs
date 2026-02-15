const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),

  // Expenses
  addExpense: (expense) => ipcRenderer.invoke('add-expense', expense),
  getExpenses: (month, year) => ipcRenderer.invoke('get-expenses', month, year),
  deleteExpense: (id) => ipcRenderer.invoke('delete-expense', id),
  updateExpense: (expense) => ipcRenderer.invoke('update-expense', expense),
});
