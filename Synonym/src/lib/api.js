// // // Typed wrapper so components never call window.api directly.
// // // Swap this file's implementation to test without Electron.

// // const api = window.api;

// // export const auth = {
// //   register:       (args) => api.register(args),
// //   login:          (args) => api.login(args),
// //   logout:         ()     => api.logout(),
// //   getSession:     ()     => api.getSession(),
// //   updatePassword: (args) => api.updatePassword(args),
// // };

// // export const fs = {
// //   homeDir:        ()     => api.homeDir(),
// //   listDir:        (dirPath) => api.listDir({ dirPath }),
// //   openFile:       (filePath) => api.openFile({ filePath }),
// //   showOpenDialog: (opts) => api.showOpenDialog(opts),
// // };

// // export const analysis = {
// //   run: (filePaths, scriptPath, modelPath) =>
// //     api.analyzeFiles({ filePaths, scriptPath, modelPath }),
// // };

// // export const db = {
// //   getFileDetail: (filename) => api.getFileDetail({ filename }),
// //   search:        (query)    => api.search({ query }),
// //   getAllAnalyzed: ()         => api.getAllAnalyzed(),
// // };




// // Typed wrapper around window.api (exposed by electron/preload.js)

// const api = window.api;

// export const fs = {
//   homeDir:        ()         => api.homeDir(),
//   getDrives:      ()         => api.getDrives(),
//   listDir:        (dirPath)  => api.listDir({ dirPath }),
//   openFile:       (filePath) => api.openFile({ filePath }),
//   showOpenDialog: (opts)     => api.showOpenDialog(opts),
// };

// export const analysis = {
//   // scriptPath and modelPath are now resolved in main.js — don't pass them from here
//   run: (filePaths) => api.analyzeFiles({ filePaths }),
// };

// export const db = {
//   getFileDetail:  (filename) => api.getFileDetail({ filename }),
//   search:         (query)    => api.search({ query }),
//   getAllAnalyzed:  ()         => api.getAllAnalyzed(),
// };





const api = window.api;

export const platform = {
  get: () => api.platform(),
};

export const fs = {
  homeDir:        ()         => api.homeDir(),
  windowsHome:    ()         => api.windowsHome(),
  getDrives:      ()         => api.getDrives(),
  listDir:        (dirPath)  => api.listDir({ dirPath }),
  openFile:       (filePath) => api.openFile({ filePath }),
  showOpenDialog: (opts)     => api.showOpenDialog(opts),
};

export const analysis = {
  run: (filePaths) => api.analyzeFiles({ filePaths }),
};

export const db = {
  getFileDetail:  (filename) => api.getFileDetail({ filename }),
  search:         (query)    => api.search({ query }),
  getAllAnalyzed:  ()         => api.getAllAnalyzed(),
};