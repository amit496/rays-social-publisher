
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PenSquare,
  Image,
  BarChart3,
  Settings
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create-post", label: "Create Post", icon: PenSquare },
  { to: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { to: "/media", label: "Media Library", icon: Image },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">R</div>
        <div>
          <h2>RAYS <span>TechLab</span></h2>
          <p>Social Publisher</p>
        </div>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="nav-menu">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <p>MADE AT RAYS TECHLAB</p>
      </div>
    </aside>
  );
}
