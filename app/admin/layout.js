import AdminThemeControl from './AdminThemeControl';
import AdminRouteSidebar from './AdminRouteSidebar';
import AdminScrollCoordinator from './AdminScrollCoordinator';
import './admin-polish.css';
import './admin-reference.css';
import './admin-immersive.css';
import './admin-sidebar-font.css';
import './admin-inset-tabs.css';

// Admin-only design shell. Original database operations and roles are untouched.
export default function AdminLayout({ children }) {
  return (
    <div className="op-admin-system">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" />
      <AdminScrollCoordinator />
      <div className="op-admin-route-layout">
        <AdminRouteSidebar />
        <div className="op-admin-view"><AdminThemeControl />{children}</div>
      </div>
    </div>
  );
}
