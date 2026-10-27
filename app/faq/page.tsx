import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | Khaak & Khazaf Crockery",
  description: "Find answers regarding Cash on Delivery, fragile packaging, and dinnerware orders in Pakistan.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Is Cash on Delivery (COD) available in my city?",
      a: "Yes! We offer Cash on Delivery across all cities and towns of Pakistan through our logistics partners TCS, Leopards, and Trax. The maximum order limit for COD is Rs. 35,000.",
    },
    {
      q: "What if a plate or bowl arrives broken or cracked?",
      a: "Every shipment is covered by our 100% Free Transit Breakage Guarantee. Simply take a 30-second continuous unboxing video when you receive your parcel, and WhatsApp it to us within 24 hours. We will ship a free replacement piece immediately.",
    },
    {
      q: "Are the plates dishwasher and microwave safe?",
      a: "Our stoneware and unadorned porcelain dinnerware is completely dishwasher and microwave safe. However, luxury bone china sets with 24k gold filigree or platinum borders must not be placed in a microwave because they contain real precious metals.",
    },
    {
      q: "How long does courier delivery take in Pakistan?",
      a: "Karachi deliveries usually take 1-2 business days. Major cities such as Lahore, Islamabad, Rawalpindi, Peshawar, Multan, and Faisalabad take 2-3 business days. Rural destinations and AJK take 3-5 business days.",
    },
    {
      q: "Can I pay via JazzCash, Easypaisa, or Bank Transfer?",
      a: "Yes, we support direct online bank transfers (Meezan Bank, Bank Alfalah) as well as mobile wallet transfers (JazzCash and Easypaisa). Simply select the 'Bank Transfer / JazzCash / Easypaisa' payment option during checkout and upload your transfer screenshot.",
    },
    {
      q: "Do you offer complete bridal / dowry dinner sets?",
      a: "Yes, our 24-piece and 72-piece Royal Mughal Bone China sets are curated specifically for bridal gifts and formal hosting. They include dinner plates, deep soup bowls, dessert bowls, large rice platters, and covered soup tureens.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xs text-stone-500 mt-1">
            Everything you need to know about purchasing luxury ceramics in Pakistan.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs"
            >
              <h2 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                {f.q}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed pl-6">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
