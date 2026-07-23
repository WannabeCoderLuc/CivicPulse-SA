import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Map, FilePlus, BarChart3, ClipboardList } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Infrastructure Map", icon: Map },
  { to: "/report", label: "Report Issue", icon: FilePlus },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "All Reports", icon: ClipboardList },
];

export default function Navbar() {
  const { state } = useAppContext();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-950 border-r border-gray-800 flex flex-col z-50">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-civic-blue rounded-xl flex items-center justify-center text-lg">???</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CivicPulse SA</p>
            <p className="text-gray-500 text-xs">City of Cape Town</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: state.socketConnected ? [1, 0.3, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-2 h-2 rounded-full flex-shrink-0 ${state.socketConnected ? "bg-green-400" : "bg-gray-600"}`}
          />
          <span className="text-xs text-gray-500">
            {state.socketConnected ? "Live Feed Active" : "Live Feed Offline"}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">Municipal Infrastructure v1.0</p>
      </div>
    </aside>
  );
}
