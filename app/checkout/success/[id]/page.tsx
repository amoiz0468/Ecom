import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { OrderSuccessClient } from "@/components/checkout/OrderSuccessClient";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <OrderSuccessClient order={order} />
      </main>
      <Footer />
    </div>
  );
}
