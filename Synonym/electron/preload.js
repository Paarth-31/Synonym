// // const { contextBridge, ipcRenderer } = require('electron');

// // // Expose a clean API to the renderer — no raw IPC access
// // contextBridge.exposeInMainWorld('api', {
// //   // Auth
// //   register:        (args) => ipcRenderer.invoke('auth:register', args),
// //   login:           (args) => ipcRenderer.invoke('auth:login', args),
// //   logout:          ()     => ipcRenderer.invoke('auth:logout'),
// //   getSession:      ()     => ipcRenderer.invoke('auth:getSession'),
// //   updatePassword:  (args) => ipcRenderer.invoke('auth:updatePassword', args),

// //   // File system
// //   homeDir:         ()     => ipcRenderer.invoke('fs:homeDir'),
// //   listDir:         (args) => ipcRenderer.invoke('fs:listDir', args),
// //   openFile:        (args) => ipcRenderer.invoke('fs:openFile', args),
// //   showOpenDialog:  (args) => ipcRenderer.invoke('fs:showOpenDialog', args),

// //   // Analysis
// //   analyzeFiles:    (args) => ipcRenderer.invoke('analysis:run', args),

// //   // DB queries
// //   getFileDetail:   (args) => ipcRenderer.invoke('db:getFileDetail', args),
// //   search:          (args) => ipcRenderer.invoke('db:search', args),
// //   getAllAnalyzed:   ()     => ipcRenderer.invoke('db:getAllAnalyzed'),
// // });


// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('api', {
//   // File system
//   homeDir:        ()     => ipcRenderer.invoke('fs:homeDir'),
//   getDrives:      ()     => ipcRenderer.invoke('fs:getDrives'),
//   listDir:        (args) => ipcRenderer.invoke('fs:listDir', args),
//   openFile:       (args) => ipcRenderer.invoke('fs:openFile', args),
//   showOpenDialog: (args) => ipcRenderer.invoke('fs:showOpenDialog', args),

//   // Analysis — paths resolved in main process, not passed from renderer
//   analyzeFiles:   (args) => ipcRenderer.invoke('analysis:run', args),

//   // DB queries
//   getFileDetail:  (args) => ipcRenderer.invoke('db:getFileDetail', args),
//   search:         (args) => ipcRenderer.invoke('db:search', args),
//   getAllAnalyzed:  ()     => ipcRenderer.invoke('db:getAllAnalyzed'),
// });





const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Platform info
  platform:       ()     => ipcRenderer.invoke('fs:platform'),

  // File system
  homeDir:        ()     => ipcRenderer.invoke('fs:homeDir'),
  windowsHome:    ()     => ipcRenderer.invoke('fs:windowsHome'),
  getDrives:      ()     => ipcRenderer.invoke('fs:getDrives'),
  listDir:        (args) => ipcRenderer.invoke('fs:listDir', args),
  openFile:       (args) => ipcRenderer.invoke('fs:openFile', args),
  showOpenDialog: (args) => ipcRenderer.invoke('fs:showOpenDialog', args),

  // Analysis — paths resolved in main process
  analyzeFiles:   (args) => ipcRenderer.invoke('analysis:run', args),

  // DB
  getFileDetail:  (args) => ipcRenderer.invoke('db:getFileDetail', args),
  search:         (args) => ipcRenderer.invoke('db:search', args),
  getAllAnalyzed:  ()     => ipcRenderer.invoke('db:getAllAnalyzed'),
});