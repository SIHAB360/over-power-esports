import AdminThemeControl from './AdminThemeControl';
import AdminRouteSidebar from './AdminRouteSidebar';
import './admin-polish.css';

// Admin-only design shell. Original database operations and roles are untouched.
export default function AdminLayout({ children }) {
  return (
    <div className="op-admin-system">
      <AdminThemeControl />
      <div className="op-admin-route-layout">
        <AdminRouteSidebar />
        <div className="op-admin-view">{children}</div>
      </div>
    </div>
  );
}
