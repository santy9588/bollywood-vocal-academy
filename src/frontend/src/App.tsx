import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/AdminPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HomePage } from "@/pages/HomePage";
import { SubjectDetailPage } from "@/pages/SubjectDetailPage";
import { SubjectsPage } from "@/pages/SubjectsPage";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// ── Root layout ──────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

// ── Routes ───────────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects",
  component: SubjectsPage,
});

const subjectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$id",
  component: SubjectDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

// ── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  subjectsRoute,
  subjectDetailRoute,
  dashboardRoute,
  adminRoute,
]);

const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
