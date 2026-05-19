"use client";

import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, useGetMe, useLogout, type User } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, X, ShoppingCart, User as UserIcon } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { toSafeArray } from "@/lib/to-safe-array";
import NotFound from "@/views/not-found";
import Home from "@/views/home";
import Services from "@/views/services";
import ServiceRequest from "@/views/services/service-request";
import Store from "@/views/store";
import ProductDetail from "@/views/product-detail";
import Cart from "@/views/cart";
import Checkout from "@/views/checkout";
import TrackOrder from "@/views/track";
import Gallery from "@/views/gallery";
import Login from "@/views/login";
import Account from "@/views/account";
import DeliveryPanel from "@/views/delivery-panel";
import AdminLayout from "@/views/admin/layout";
import AdminDashboard from "@/views/admin/index";
import AdminOrders from "@/views/admin/orders";
import AdminProducts from "@/views/admin/products";
import AdminServices from "@/views/admin/services";
import AdminBookings from "@/views/admin/bookings";
import AdminCustomers from "@/views/admin/customers";
import AdminInventory from "@/views/admin/inventory";
import AdminAccounting from "@/views/admin/accounting";
import AdminGallery from "@/views/admin/gallery-admin";
import AdminDelivery from "@/views/admin/delivery-admin";
import AdminReviews from "@/views/admin/reviews";
import AdminEmployees from "@/views/admin/employees";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Navbar() {
  const [open, setOpen] = useState(false);
  const { items } = useCartStore();
  const activeQueryClient = useQueryClient();
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false },
  });
  const logoutMutation = useLogout();
  const cartItems = toSafeArray<CartItem>(items);
  const cartCount = cartItems.reduce((a, i) => a + Number(i?.quantity ?? 0), 0);

  const links = [
    { to: "/services", label: "الخدمات" },
    { to: "/store", label: "المتجر" },
    { to: "/track", label: "تتبع الطلب" },
    { to: "/gallery", label: "أعمالنا" },
  ];
  const controlPanelPath = user?.role === "delivery" ? "/delivery" : "/admin";

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        activeQueryClient.setQueryData(getGetMeQueryKey(), undefined);
        activeQueryClient.removeQueries({ queryKey: getGetMeQueryKey() });
        setOpen(false);
      },
    });
  };

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary tracking-wider">
          مجموعة علي جان
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-primary" : "hover:text-primary"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to={controlPanelPath}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
              </Link>
              <button
                onClick={logout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" /> تسجيل خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
              <UserIcon className="w-4 h-4" /> حسابي
            </Link>
          )}
          <button className="md:hidden p-2 hover:text-primary transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium hover:text-primary transition-colors py-2">{l.label}</Link>
            ))}
            <Link to="/cart" onClick={() => setOpen(false)} className="text-sm font-medium hover:text-primary py-2">
              السلة {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link
                  to={controlPanelPath}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-primary hover:opacity-80 py-2"
                >
                  لوحة التحكم
                </Link>
                <button
                  onClick={logout}
                  disabled={logoutMutation.isPending}
                  className="text-right text-sm font-medium hover:text-primary py-2 disabled:opacity-50"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium hover:text-primary py-2">تسجيل الدخول</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">مجموعة علي جان</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">طوزخورماتو | شارع العام | مقابل دوز مول</p>
          <p className="text-muted-foreground text-sm mt-2">مجموعة فاخرة متكاملة لتلبية احتياجاتكم في جميع المناسبات</p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li dir="ltr">07729000122</li>
            <li dir="ltr">07725762520</li>
            <li><a href="https://wa.me/9647725762520" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">واتساب</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">تابعنا</h4>
          <div className="flex gap-4 text-sm">
            <a href="https://www.instagram.com/koshat_alijan" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <a href="https://www.facebook.com/share/16vQwtxQPW" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Facebook</a>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
            <Link to="/admin" className="hover:text-primary transition-colors">لوحة الإدارة</Link>
            <Link to="/delivery" className="hover:text-primary transition-colors">لوحة التوصيل</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} ENG: Hussen Ali Hameed. All rights reserved.
      </div>
    </footer>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}

function hasPermission(user: User | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return toSafeArray<string>((user as any).permissions).includes(permission);
}

function Unauthorized() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">غير مصرح لك بالدخول</h1>
        <p className="text-muted-foreground">لا تملك الصلاحية المطلوبة لفتح هذا القسم.</p>
      </div>
    </div>
  );
}

function RequireAdminSession({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function RequirePermission({ children, permission }: { children: React.ReactNode; permission: string }) {
  const { data: user, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!hasPermission(user, permission)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<RequireAdminSession><AdminLayout /></RequireAdminSession>}>
              <Route index element={<RequirePermission permission="view_dashboard"><AdminDashboard /></RequirePermission>} />
              <Route path="orders" element={<RequirePermission permission="view_orders"><AdminOrders /></RequirePermission>} />
              <Route path="products" element={<RequirePermission permission="manage_products"><AdminProducts /></RequirePermission>} />
              <Route path="services" element={<RequirePermission permission="manage_services"><AdminServices /></RequirePermission>} />
              <Route path="bookings" element={<RequirePermission permission="manage_services"><AdminBookings /></RequirePermission>} />
              <Route path="customers" element={<RequirePermission permission="manage_customers"><AdminCustomers /></RequirePermission>} />
              <Route path="inventory" element={<RequirePermission permission="manage_inventory"><AdminInventory /></RequirePermission>} />
              <Route path="accounting" element={<RequirePermission permission="manage_accounting"><AdminAccounting /></RequirePermission>} />
              <Route path="gallery" element={<RequirePermission permission="manage_portfolio"><AdminGallery /></RequirePermission>} />
              <Route path="delivery" element={<RequirePermission permission="manage_delivery"><AdminDelivery /></RequirePermission>} />
              <Route path="reviews" element={<RequirePermission permission="manage_reviews"><AdminReviews /></RequirePermission>} />
              <Route path="employees" element={<RequirePermission permission="manage_employees"><AdminEmployees /></RequirePermission>} />
            </Route>

            <Route path="/delivery" element={<RequireAdminSession><RequirePermission permission="manage_delivery"><PublicLayout><DeliveryPanel /></PublicLayout></RequirePermission></RequireAdminSession>} />
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/services/:type" element={<PublicLayout><ServiceRequest /></PublicLayout>} />
            <Route path="/book" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/book/:type" element={<PublicLayout><ServiceRequest /></PublicLayout>} />
            <Route path="/store" element={<PublicLayout><Store /></PublicLayout>} />
            <Route path="/store/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/track" element={<PublicLayout><TrackOrder /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/account" element={<PublicLayout><Account /></PublicLayout>} />
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
