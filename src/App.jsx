import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ChatbotWidget from './components/ChatbotWidget';
import { routes } from './utils/routes';
import './styles/global.css';

const Login = lazy(() => import('./pages/Login'));

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        color: 'var(--color-gray-400)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          } 
        />
        <Route element={<AppLayout />}>
          {routes.map((route) => {
            const PageComponent = route.element;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PageComponent />
                  </Suspense>
                }
              />
            );
          })}
          {/* Catch-all route to redirect unknown URLs to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  );
}
