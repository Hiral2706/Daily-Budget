import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import FloatingAddButton from './components/FloatingAddButton';

import Setup      from './pages/Setup';
import Home       from './pages/Home';
import AddExpense from './pages/AddExpense';
import History    from './pages/History';
import Calendar   from './pages/Calendar';
import Insights   from './pages/Insights';
import Settings   from './pages/Settings';

function AppRoutes() {
  const { state } = useApp();
  const isSetup = state.settings.isSetupDone;

  if (!isSetup) {
    return (
      <Routes>
        <Route path="*" element={<Setup />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/"         element={<Home />}       />
        <Route path="/add"      element={<AddExpense />} />
        <Route path="/history"  element={<History />}    />
        <Route path="/calendar" element={<Calendar />}   />
        <Route path="/insights" element={<Insights />}   />
        <Route path="/settings" element={<Settings />}   />
        <Route path="/setup"    element={<Setup />}      />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <FloatingAddButton />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
