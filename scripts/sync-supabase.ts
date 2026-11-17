import {
  CatalogRepository,
  DiscountRepository,
  InquiryRepository,
  OrderRepository,
  SettingsRepository,
  ensureCoreConfig,
} from "../lib/db/repositories";

async function main() {
  console.log("🔄 Verifying Supabase Postgres connection & core config...");
  await ensureCoreConfig();

  const [categories, zones, settings, products, orders, discounts, inquiries] =
    await Promise.all([
      CatalogRepository.getAllCategories(),
      SettingsRepository.getShippingZones(),
      SettingsRepository.getStoreSettings(),
      CatalogRepository.getAllProducts({ includeUnpublished: true }),
      OrderRepository.getAllOrders(),
      DiscountRepository.getAll(),
      InquiryRepository.getAll(),
    ]);

  console.log(`✓ Categories: ${categories.length}`);
  console.log(`✓ Shipping zones: ${zones.length} (store: ${settings.store_name})`);
  console.log(`✓ Products: ${products.length}`);
  console.log(`✓ Orders: ${orders.length}`);
  console.log(`✓ Discounts: ${discounts.length}`);
  console.log(`✓ Customer inquiries: ${inquiries.length}`);
  console.log("🎉 Supabase Postgres verification complete!");
}

main().catch((err) => {
  console.error("Supabase verification failed:", err);
  process.exit(1);
});
