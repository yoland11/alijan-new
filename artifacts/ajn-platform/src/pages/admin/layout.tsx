import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Wrench, Calendar, Users, Archive, DollarSign, Image, Truck, Star, UserCog, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { getGetMeQueryKey, useGetMe, type User } from "@workspace/api-client-react";
import { toSafeArray } from "@/lib/to-safe-array";

const navItems = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true, permission: "view_dashboard" },
  { to: "/admin/orders", label: "الطلبات", icon: Package, permission: "view_orders" },
  { to: "/admin/products", label: "المنتجات", icon: ShoppingBag, permission: "manage_products" },
  { to: "/admin/services", label: "طلبات الخدمات", icon: Wrench, permission: "manage_services" },
  { to: "/admin/bookings", label: "الحجوزات", icon: Calendar, permission: "manage_services" },
  { to: "/admin/customers", label: "الزبائن", icon: Users, permission: "manage_customers" },
  { to: "/admin/inventory", label: "المخزون", icon: Archive, permission: "manage_inventory" },
  { to: "/admin/accounting", label: "الحسابات", icon: DollarSign, permission: "manage_accounting" },
  { to: "/admin/gallery", label: "المعرض", icon: Image, permission: "manage_portfolio" },
  { to: "/admin/delivery", label: "التوصيل", icon: Truck, permission: "manage_delivery" },
  { to: "/admin/reviews", label: "التقييمات", icon: Star, permission: "manage_reviews" },
  { to: "/admin/employees", label: "الموظفون", icon: UserCog, permission: "manage_employees" },
];

function canSee(user: User | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return toSafeArray<string>((user as any).permissions).includes(permission);
}

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false },
  });

  const isActive = (to: string, exact?: boolean) => exact ? location.pathname === to : location.pathname.startsWith(to) && to !== "/admin";
  const visibleNavItems = navItems.filter((item) => canSee(user, item.permission));

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      <aside className={`flex-shrink-0 bg-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && <p className="font-bold text-primary">لوحة الإدارة</p>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors mr-auto">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNavItems.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                title={collapsed ? label : undefined}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors`}>
            <ChevronLeft className="w-4 h-4 rotate-180 flex-shrink-0" />
            {!collapsed && <span>العودة للموقع</span>}
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
