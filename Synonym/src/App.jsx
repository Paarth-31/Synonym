// import React, { useState, useEffect } from 'react';
// import { auth } from './lib/api.js';
// import LoginPage    from './pages/LoginPage.jsx';
// import SignupPage   from './pages/SignupPage.jsx';
// import ForgotPage   from './pages/ForgotPage.jsx';
// import MainWindow   from './pages/MainWindow.jsx';
// import Visualizer   from './pages/Visualizer.jsx';

// export default function App() {
//   const [page, setPage]       = useState('login');   // login | signup | forgot | main | viz
//   const [session, setSession] = useState(null);
//   const [vizFiles, setVizFiles] = useState([]);

//   // Resume session on startup
//   useEffect(() => {
//     auth.getSession().then(s => {
//       if (s) { setSession(s); setPage('main'); }
//     });
//   }, []);

//   const handleLogin = (s) => { setSession(s); setPage('main'); };
//   const handleLogout = async () => {
//     await auth.logout();
//     setSession(null);
//     setPage('login');
//   };
//   const handleOpenViz = (files) => { setVizFiles(files); setPage('viz'); };

//   return (
//     <>
//       {page === 'login'  && <LoginPage  onLogin={handleLogin} onSignup={() => setPage('signup')} onForgot={() => setPage('forgot')} />}
//       {page === 'signup' && <SignupPage onLogin={handleLogin} onBack={() => setPage('login')} />}
//       {page === 'forgot' && <ForgotPage onBack={() => setPage('login')} />}
//       {page === 'main'   && <MainWindow session={session} onLogout={handleLogout} onOpenViz={handleOpenViz} />}
//       {page === 'viz'    && <Visualizer files={vizFiles} onBack={() => setPage('main')} />}
//     </>
//   );
// }


import React, { useState } from 'react';
import MainWindow  from './pages/MainWindow.jsx';
import Visualizer  from './pages/Visualizer.jsx';

// Login removed — app opens directly to the file explorer.
// Auth infrastructure kept in main.js in case you re-enable it later.

export default function App() {
  const [page, setPage]         = useState('main');
  const [vizFiles, setVizFiles] = useState([]);

  const handleOpenViz = (files) => { setVizFiles(files); setPage('viz'); };

  return (
    <>
      {page === 'main' && (
        <MainWindow onOpenViz={handleOpenViz} />
      )}
      {page === 'viz' && (
        <Visualizer files={vizFiles} onBack={() => setPage('main')} />
      )}
    </>
  );
}