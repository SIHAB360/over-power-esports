import AdminThemeControl from './AdminThemeControl';
import AdminRouteSidebar from './AdminRouteSidebar';
import AdminScrollCoordinator from './AdminScrollCoordinator';
import './admin-polish.css';
import './admin-reference.css';
import './admin-immersive.css';

// Admin-only design shell. Original database operations and roles are untouched.
export default function AdminLayout({ children }) {
  return (
    <div className="op-admin-system">
      <AdminScrollCoordinator />
      <div className="op-admin-route-layout">
        <AdminRouteSidebar />
        <div className="op-admin-view"><AdminThemeControl />{children}</div>
      </div>
    </div>
  );
}
