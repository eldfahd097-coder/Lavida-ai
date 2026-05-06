import * as cookie from "cookie";
import type { User } from "@db/schema";
import { Session } from "@contracts/constants";

export const DEV_ADMIN_EMAIL = "info@lavidaresort.ly";
export const DEV_ADMIN_PASSWORD = "lavida123";
const DEV_ADMIN_SESSION_VALUE = "lavida_dev_admin";

const DEV_ADMIN_USER: User = {
  id: 1,
  unionId: "local-dev-admin",
  name: "La Vida Admin",
  email: DEV_ADMIN_EMAIL,
  avatar: null,
  role: "admin",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignInAt: new Date(),
};

export function isValidDevAdminLogin(email: string, password: string): boolean {
  return email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD;
}

export function createDevAdminSessionValue(): string {
  return DEV_ADMIN_SESSION_VALUE;
}

export function authenticateLocalSession(headers: Headers): User | undefined {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token || token !== DEV_ADMIN_SESSION_VALUE) {
    return undefined;
  }
  return DEV_ADMIN_USER;
}
