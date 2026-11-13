import { ClipboardList, FlaskConical, User } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { ApiStatus } from "./ApiStatus";

const links = [
  { to: "/patients", label: "Patients", icon: User },
  { to: "/catalog", label: "Test catalog", icon: FlaskConical },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export function SideNav() {
  return (
    <nav
      aria-label="Main"
      className="flex flex-col gap-7 bg-sidebar px-5 py-7 text-sidebar-foreground md:w-60 md:shrink-0"
    >
      <div className="px-3 text-xl font-extrabold tracking-tight">
        Lab Orders <span className="text-sidebar-primary">Lite</span>
      </div>
      <ul className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium",
                  isActive
                    ? "bg-sidebar-primary font-bold text-sidebar-primary-foreground"
                    : "hover:bg-white/10",
                )
              }
            >
              <Icon aria-hidden className="size-[18px]" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto px-3">
        <ApiStatus />
      </div>
    </nav>
  );
}
