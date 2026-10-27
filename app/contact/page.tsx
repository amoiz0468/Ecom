"use client";

import { useState } from "react";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div>
          <h1 className="font-serif text-3xl font-bold">Contact Our Crockery Studio</h1>
          <p className="text-xs text-stone-500 mt-1">
            Need guidance selecting dinnerware, ordering custom dinner sets, or tracking your delivery?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Studio Contact Details */}
          <div className="space-y-6 text-xs text-stone-600 dark:text-stone-300">
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Customer Support & Concierge
              </h2>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">WhatsApp Support (Fastest)</strong>
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
                  <strong className="text-stone-900 dark:text-stone-100 block">Phone Helpline</strong>
                  <span>+92 21 35812345 (Mon - Sat, 10 AM - 7 PM PKT)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">Email</strong>
                  <span>support@khaak-khazaf.pk</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">Studio & Fulfillment Warehouse</strong>
                  <span>Plot 18-C, Street 4, Korangi Industrial Area, Karachi, Pakistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold">Inquiry Received!</h3>
                <p className="text-xs text-stone-500">
                  Our customer care team will respond via WhatsApp or email within a few hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <h2 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                  Send Us a Message
                </h2>
                <div>
                  <label className="font-semibold block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Ali"
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Message / Question *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you are looking for..."
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 dark:bg-amber-700 text-white font-semibold rounded-lg text-xs hover:opacity-90 transition"
                >
                  Send Inquiry
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
