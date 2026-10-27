import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Crockery Care Guide: Ceramics & Fine Bone China | Khaak & Khazaf",
  description: "Learn how to preserve the glaze, gold gilding, and thermal resilience of your dinner sets.",
};

export default function CareGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tableware & Ceramics Care Guide</h1>
          <p className="text-xs text-stone-500 mt-1">
            Tips to keep your handcrafted ceramics, bone china, and porcelain radiant for generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gold Filigree & Microwave */}
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> 1. Gold-Rimmed Bone China
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Dinner sets adorned with genuine 24k gold or platinum detailing (such as our Royal Mughal collection) contain authentic conductive metals and <strong>must never be placed in a microwave</strong>.
            </p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              For microwave heating, use our unadorned stoneware or solid porcelain dinner plates.
            </p>
          </div>

          {/* Dishwasher & Thermal Shock */}
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2. Preventing Thermal Shock
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Sudden extreme temperature fluctuations can cause hairline crazing in glazed ceramics. Never transfer a hot earthenware baking dish directly from a preheated oven into ice-cold water or onto a wet marble countertop.
            </p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Always place hot serving dishes onto a cork or wooden trivet.
            </p>
          </div>

          {/* Removing Turmeric & Chai Stains */}
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              3. Turmeric (Haldi) & Strong Chai Stains
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Rich Pakistani curries with turmeric can temporarily leave faint golden tinting on light glazes if left unwashed overnight.
            </p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Rinse plates promptly with warm water. For stubborn tea or haldi marks, rub gently with a paste of baking soda and a drop of lemon juice using a soft sponge. Never use harsh metal wire scouring pads.
            </p>
          </div>

          {/* Stacking & Storage */}
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              4. Safe Stacking & Cabinet Storage
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              When stacking large dinner plates, place a soft paper napkin or felt separator between each plate to prevent surface micro-scratches on delicate glazes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
