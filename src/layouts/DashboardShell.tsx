import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Library,
  UserCircle,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/practice', label: 'Practice', icon: BookOpen },
  { to: '/app/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/app/resources', label: 'Resources', icon: Library },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <Link to="/" className="mb-6 block text-lg font-semibold text-primary hover:underline">
            Placement Prep
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h1 className="text-xl font-semibold">Placement Prep</h1>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              U
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
