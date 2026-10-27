import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Truck, MapPin, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Rates Across Pakistan | Khaak & Khazaf",
  description: "Nationwide express delivery via TCS, Leopards, and Trax with free shipping on orders over Rs. 5,000.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Shipping & Courier Delivery</h1>
          <p className="text-xs text-stone-500 mt-1">
            Carefully dispatched across all provinces, cities, and towns of Pakistan.
          </p>
        </div>

        {/* Free Shipping Highlight */}
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-800 flex items-center gap-4">
          <Truck className="w-10 h-10 text-amber-700 shrink-0" />
          <div className="text-xs">
            <strong className="text-sm font-bold block text-stone-900 dark:text-stone-100">
              Free Nationwide Delivery on Orders Over Rs. 5,000
            </strong>
            <p className="text-stone-600 dark:text-stone-400 mt-0.5">
              Applies automatically at checkout for all Pakistani cities including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Faisalabad, and Multan.
            </p>
          </div>
        </div>

        {/* City Rates Table */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold">Standard Delivery Rates (Under Rs. 5,000)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-stone-200 dark:divide-stone-800">
              <thead>
                <tr className="text-stone-500">
                  <th className="py-2.5">Zone / City</th>
                  <th className="py-2.5">Estimated Transit Time</th>
                  <th className="py-2.5">Base Rate (Up to 1kg)</th>
                  <th className="py-2.5">Additional 1kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                <tr>
                  <td className="py-2.5 font-bold">Karachi Metro</td>
                  <td>1 – 2 Business Days</td>
                  <td>Rs. 200</td>
                  <td>Rs. 100</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">Major Cities (Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar)</td>
                  <td>2 – 3 Business Days</td>
                  <td>Rs. 280</td>
                  <td>Rs. 120</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">Rest of Pakistan & AJK</td>
                  <td>3 – 5 Business Days</td>
                  <td>Rs. 350</td>
                  <td>Rs. 150</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash on Delivery Details */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3 text-xs text-stone-700 dark:text-stone-300">
          <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Cash on Delivery (COD) Terms
          </h3>
          <p>
            - Cash on Delivery is available across Pakistan up to a maximum order value of <strong>Rs. 35,000</strong>.
          </p>
          <p>
            - Orders above Rs. 35,000 require advance payment via Bank Transfer or Safepay card checkout to safeguard high-value porcelain during logistics handling.
          </p>
          <p>
            - A nominal COD handling charge of <strong>Rs. 150</strong> is applied by the courier partner for cash collection.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
