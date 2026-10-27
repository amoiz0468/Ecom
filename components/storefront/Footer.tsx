import Link from "next/link";
import { ShieldCheck, Truck, Phone, Mail, MapPin, Sparkles, MessageCircle } from "lucide-react";

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Khaak & Khazaf, I would like to inquire about your crockery sets."
  )}`;

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-sm">
      {/* Trust Pillars */}
      <div className="border-b border-stone-800 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-800 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-100 text-base mb-1">Breakage Guarantee</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                100% free piece replacement for transit damage. Simply record a quick unboxing video.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-800 text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-100 text-base mb-1">Nationwide Delivery</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                TCS, Leopards & Trax delivery across all cities of Pakistan. Free delivery over Rs. 5,000.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-800 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-100 text-base mb-1">Authentic Craft</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                High-fired ceramics, bone china, and porcelain. Lead-free glazes & food-grade finishes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-800 text-amber-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-100 text-base mb-1">WhatsApp Concierge</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                Need help picking dinnerware or ordering custom piece sets? Chat directly with us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-wider text-stone-100">
              KHAAK & KHAZAF
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-400">
              Ceramic & Crockery Studio • Pakistan
            </span>
          </Link>
          <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
            Curating luxury bone china dinner sets, handcrafted Multani Kashi platters, and artisan tableware for homes and dastarkhwans across Pakistan.
          </p>

          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp ({whatsappNumber})
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-stone-200 mb-3 text-sm">Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/shop?category=dinner-sets" className="hover:text-amber-400">Dinner Sets</Link></li>
            <li><Link href="/shop?category=bowls" className="hover:text-amber-400">Soup & Ramen Bowls</Link></li>
            <li><Link href="/shop?category=cups-mugs" className="hover:text-amber-400">Chai & Kehwa Sets</Link></li>
            <li><Link href="/shop?category=plates-platters" className="hover:text-amber-400">Platters & Plates</Link></li>
            <li><Link href="/shop?category=serving-dishes" className="hover:text-amber-400">Serving Tureens</Link></li>
            <li><Link href="/shop?category=glassware" className="hover:text-amber-400">Ribbed Glassware</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-stone-200 mb-3 text-sm">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/track" className="hover:text-amber-400 font-semibold text-amber-300">Track Your Order</Link></li>
            <li><Link href="/breakage-policy" className="hover:text-amber-400">Breakage & Transit Policy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-amber-400">Shipping & Delivery Rates</Link></li>
            <li><Link href="/care-guide" className="hover:text-amber-400">Crockery Care & Cleaning</Link></li>
            <li><Link href="/faq" className="hover:text-amber-400">Frequently Asked Questions</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-stone-200 mb-3 text-sm">Payment Methods</h4>
          <p className="text-xs text-stone-400 mb-3">
            Secure checkout via Cash on Delivery, Bank Transfer, JazzCash, Easypaisa, or Safepay.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded">COD</span>
            <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded">JazzCash</span>
            <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded">Easypaisa</span>
            <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded">Meezan Bank</span>
            <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-1 rounded">Safepay</span>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <span className="text-[11px] text-stone-500 block mb-1">Couriers:</span>
            <div className="flex gap-2 text-xs text-stone-400">
              <span>TCS</span> • <span>Leopards</span> • <span>PostEx</span> • <span>Trax</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Khaak & Khazaf Ceramics. Operating throughout Pakistan.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/admin" className="text-stone-400 hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
