import AdminThemeControl from './AdminThemeControl';
import './admin-polish.css';

// Admin-only design shell. Existing data routes, screens and permissions are untouched.
export default function AdminLayout({ children }) {
  return (
    <div className="op-admin-system">
      <AdminThemeControl />
      <div className="op-admin-view">{children}</div>
    </div>
  );
}
