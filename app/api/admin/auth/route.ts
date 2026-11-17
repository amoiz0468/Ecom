import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyCredentials,
  getAdminSession,
} from "@/lib/auth/admin";
import { AdminUserRepository } from "@/lib/db/repositories";
import { verifyPasswordScrypt } from "@/lib/auth/password";
import { appendAuditLog } from "@/lib/db/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { AdminLoginInputSchema } from "@/lib/validators";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, session });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";

    const rate = checkRateLimit(`admin-login:${ip}`, 10, 5 * 60 * 1000);
    if (!rate.allowed) {
      await appendAuditLog({
        actor: "anonymous",
        action: "ADMIN_LOGIN_RATE_LIMITED",
        entity_type: "auth",
        entity_id: ip,
        details: `Rate limit exceeded from IP ${ip}`,
        ip_address: ip,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rate.retryAfterSeconds}s and try again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = AdminLoginInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // Check Supabase admin_users table (scrypt hash) OR environment credentials
    const dbAdmin = await AdminUserRepository.findByUsername(username);

    const isValidDbUser =
      dbAdmin && verifyPasswordScrypt(password, dbAdmin.password_hash);
    const isValidEnvUser = verifyCredentials(username, password);

    if (!isValidDbUser && !isValidEnvUser) {
      await appendAuditLog({
        actor: username,
        action: "ADMIN_LOGIN_FAILED",
        entity_type: "auth",
        entity_id: username,
        details: `Failed login attempt for username "${username}"`,
        ip_address: ip,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin username or password.",
        },
        { status: 401 }
      );
    }

    if (dbAdmin) {
      await AdminUserRepository.touchLastLogin(dbAdmin.id);
    }

    await appendAuditLog({
      actor: username,
      action: "ADMIN_LOGIN_SUCCESS",
      entity_type: "auth",
      entity_id: username,
      details: `Admin "${username}" signed in successfully`,
      ip_address: ip,
    });

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({
      success: true,
      username,
      role: "admin",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication request failed." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getAdminSession();
  if (session) {
    await appendAuditLog({
      actor: session.username,
      action: "ADMIN_LOGOUT",
      entity_type: "auth",
      entity_id: session.username,
      details: `Admin "${session.username}" signed out`,
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
