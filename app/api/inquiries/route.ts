import { NextRequest, NextResponse } from "next/server";
import { InquiryRepository } from "@/lib/db/repositories";
import { getAdminSession } from "@/lib/auth/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`inquiry-create:${ip}`, 5, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many inquiries. Please wait ${rate.retryAfterSeconds}s before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone number, and message are required." },
        { status: 400 }
      );
    }

    const inquiry = InquiryRepository.create({
      name,
      phone,
      email: email || undefined,
      message,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit inquiry." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (typeof body?.id === "string") {
      InquiryRepository.markResolved(body.id, session.username);
    }

    return NextResponse.json({
      success: true,
      inquiries: InquiryRepository.getAll(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update inquiry." },
      { status: 500 }
    );
  }
}

