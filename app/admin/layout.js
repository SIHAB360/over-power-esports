import AdminThemeControl from './AdminThemeControl';
import AdminRouteSidebar from './AdminRouteSidebar';
import AdminScrollCoordinator from './AdminScrollCoordinator';
import './admin-polish.css';
import './admin-reference.css';

// Admin-only design shell. Original database operations and roles are untouched.
export default function AdminLayout({ children }) {
  return (
    <div className="op-admin-system">
      <AdminThemeControl />
      <AdminScrollCoordinator />
      <div className="op-admin-route-layout">
        <AdminRouteSidebar />
        <div className="op-admin-view">{children}</div>
      </div>
    </div>
  );
}
