import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getSessionFromRequest, type AuthRole, type AuthSession } from "../lib/auth";
import { hasPermission, type PermissionKey } from "../lib/permissions";

declare global {
  namespace Express {
    interface Request {
      user?: AuthSession;
    }
  }
}

export const attachAuthUser: RequestHandler = (req, _res, next) => {
  const session = getSessionFromRequest(req);
  if (session) {
    req.user = session;
  }
  next();
};

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "تسجيل الدخول مطلوب" });
    return;
  }

  next();
};

export function requireRole(roles: AuthRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "تسجيل الدخول مطلوب" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "غير مصرح لك بالدخول" });
      return;
    }

    next();
  };
}

export function requirePermission(permission: PermissionKey): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "تسجيل الدخول مطلوب" });
      return;
    }

    if (!hasPermission(req.user, permission)) {
      res.status(403).json({ error: "غير مصرح لك بالدخول" });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole(["owner", "admin"]);

function isWrite(method: string): boolean {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

export function protectApiRoutes(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const path = req.path;
  const method = req.method.toUpperCase();

  if (
    path === "/healthz" ||
    path.startsWith("/auth/") ||
    method === "OPTIONS"
  ) {
    next();
    return;
  }

  if (
    path.startsWith("/dashboard")
  ) {
    requirePermission("view_dashboard")(req, res, next);
    return;
  }

  if (path.startsWith("/customers")) {
    requirePermission("manage_customers")(req, res, next);
    return;
  }

  if (path.startsWith("/employees")) {
    requirePermission("manage_employees")(req, res, next);
    return;
  }

  if (path.startsWith("/inventory")) {
    requirePermission("manage_inventory")(req, res, next);
    return;
  }

  if (path.startsWith("/accounting")) {
    requirePermission("manage_accounting")(req, res, next);
    return;
  }

  if (path.startsWith("/bookings")) {
    requirePermission("manage_services")(req, res, next);
    return;
  }

  if (path.startsWith("/orders/track")) {
    next();
    return;
  }

  if (path.startsWith("/orders")) {
    if (method === "POST" && path === "/orders") {
      next();
      return;
    }
    if (method === "GET") {
      if (
        req.user &&
        (hasPermission(req.user, "view_orders") ||
          hasPermission(req.user, "manage_delivery"))
      ) {
        next();
        return;
      }
      requirePermission("view_orders")(req, res, next);
      return;
    }
    if (method === "PATCH") {
      requirePermission("change_order_status")(req, res, next);
      return;
    }
    requirePermission("edit_order")(req, res, next);
    return;
  }

  if (path.startsWith("/products") && isWrite(method)) {
    requirePermission("manage_products")(req, res, next);
    return;
  }

  if (path.startsWith("/uploads")) {
    requirePermission("manage_products")(req, res, next);
    return;
  }

  if (path === "/services" && isWrite(method)) {
    requirePermission("manage_services")(req, res, next);
    return;
  }

  if (path.startsWith("/service-requests")) {
    if (method === "POST" && path === "/service-requests") {
      next();
      return;
    }
    requirePermission("manage_services")(req, res, next);
    return;
  }

  if (path.startsWith("/delivery/zones") && isWrite(method)) {
    requirePermission("manage_delivery")(req, res, next);
    return;
  }

  if (path.startsWith("/gallery") && isWrite(method)) {
    requirePermission("manage_portfolio")(req, res, next);
    return;
  }

  if (path.startsWith("/reviews")) {
    if (method === "GET" && req.query.status === "approved") {
      next();
      return;
    }
    if (method === "POST") {
      next();
      return;
    }
    requirePermission("manage_reviews")(req, res, next);
    return;
  }

  next();
}
