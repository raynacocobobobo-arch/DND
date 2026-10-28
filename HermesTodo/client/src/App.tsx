import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { queryClient } from "./api/queryClient";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ListsPage } from "./pages/ListsPage";
import { ListDetailPage } from "./pages/ListDetailPage";
import { ContextDetailPage } from "./pages/ContextDetailPage";
import { AIPage } from "./pages/AIPage";

function PlaceholderPage({ title }: { title: string }) {
  return <section><h1>{title}</h1></section>;
}

function AuthenticatedApp() {
  const { authenticated, loading } = useAuth();
  if (loading) return <main className="loading-page" aria-live="polite">正在打开 HermesTodo…</main>;
  if (!authenticated) return <LoginPage />;
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ListsPage />} />
        <Route path="inbox" element={<HomePage />} />
        <Route path="contexts" element={<Navigate to="/" replace />} />
        <Route path="lists/:id" element={<ListDetailPage />} />
        <Route path="contexts/:id" element={<ContextDetailPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  const Router = import.meta.env.VITE_STATIC_PREVIEW === "true" ? HashRouter : BrowserRouter;
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
