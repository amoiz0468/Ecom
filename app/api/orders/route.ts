import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
} from "@/lib/orders";
import { getAdminSession } from "@/lib/auth/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { UpdateOrderStatusInputSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const phone = searchParams.get("phone");

  if (id) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`order-lookup:${ip}`, 30, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Wait ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const session = await getAdminSession();
    const isAdmin = session?.role === "admin";

    if (!isAdmin && (!phone || phone.replace(/\D/g, "").length < 7)) {
      return NextResponse.json(
        { error: "Customer phone verification is required to view order details." },
        { status: 403 }
      );
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAdmin) {
      const providedDigits = (phone || "").replace(/\D/g, "").slice(-10);
      const guestDigits = (order.guest_info?.phone || "").replace(/\D/g, "").slice(-10);
      const shippingDigits = (order.shipping_address?.phone || "").replace(/\D/g, "").slice(-10);
      if (
        !providedDigits ||
        (providedDigits !== guestDigits && providedDigits !== shippingDigits)
      ) {
        return NextResponse.json(
          { error: "Phone number does not match this order." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ order });
  }

  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin credentials required to list all orders" },
      { status: 401 }
    );
  }

  const limitParam = Number(searchParams.get("limit") || "0");
  const offsetParam = Number(searchParams.get("offset") || "0");
  const orders = await getAllOrders(
    limitParam > 0 ? { limit: limitParam, offset: offsetParam } : undefined
  );
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`order-create:${ip}`, 15, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please wait ${rate.retryAfterSeconds}s before placing another order.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const res = await placeOrder(body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateOrderStatusInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "orderId and valid status are required",
        },
        { status: 400 }
      );
    }

    const { orderId, status, paymentStatus, trackingNumber, courierCode } =
      parsed.data;

    const updated = await updateOrderStatus(
      orderId,
      status,
      paymentStatus,
      trackingNumber,
      courierCode
    );
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
