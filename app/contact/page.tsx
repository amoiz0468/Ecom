"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StoreSettings } from "@/types";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch("/api/store-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const whatsappNumber =
    settings?.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "+923001234567";
  const storeEmail = settings?.store_email || "support@almoincrockery.pk";
  const storePhone = settings?.store_phone || "+92 21 35812345";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10 w-full">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Contact Almoin Crockery
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Need guidance selecting dinnerware, ordering custom dinner sets, or
            tracking your delivery?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Studio Contact Details */}
          <div className="space-y-6 text-xs text-stone-600">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Customer Support &amp; Concierge
              </h2>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">
                    WhatsApp Support (Fastest)
                  </strong>
                  <span>{whatsappNumber}</span>
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-emerald-700 font-semibold hover:underline mt-0.5"
                  >
                    Open WhatsApp Chat →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">
                    Phone Helpline
                  </strong>
                  <span>{storePhone} (Mon - Sat, 10 AM - 7 PM PKT)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">Email</strong>
                  <span>{storeEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">
                    Fulfillment Hub
                  </strong>
                  <span>Pakistan Nationwide Dispatch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real Database-Backed Contact Inquiry Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold">
                  Inquiry Saved &amp; Received!
                </h3>
                <p className="text-xs text-stone-500">
                  Your message has been logged directly into our store admin
                  dashboard. Our team will reach out via WhatsApp or phone
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif text-base font-bold text-stone-900">
                  Send Us a Message
                </h2>
                <div>
                  <label className="font-semibold block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fatima Ali"
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fatima@example.com"
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Message / Question *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you are looking for..."
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>
                {error && (
                  <p className="text-red-600 font-medium text-xs">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-stone-900 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold rounded-full text-xs transition cursor-pointer"
                >
                  {submitting ? "Sending Inquiry..." : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
