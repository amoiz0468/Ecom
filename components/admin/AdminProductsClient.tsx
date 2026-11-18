"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product, Category, StoreDepartment } from "@/types";
import { STORE_DEPARTMENTS } from "@/lib/data/constants";
import { formatPKR } from "@/lib/utils";
import {
  saveProductAction,
  updateVariantStockPriceAction,
  toggleProductFlagAction,
  deleteProductAction,
} from "@/lib/admin/actions";
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  PackagePlus,
  Upload,
  ImagePlus,
  Link2,
  Loader2,
  Cloud,
  Copy,
  FolderOpen,
} from "lucide-react";

interface CloudinaryLibraryAsset {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

const MATERIALS = Array.from(
  new Set(STORE_DEPARTMENTS.flatMap((d) => d.materials))
);

interface VariantFormRow {
  id?: string;
  sku: string;
  title: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  piece_count: number;
  weight_grams: number;
}

export function AdminProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal state for Create / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id || "cat-dinner-sets"
  );
  const [storeType, setStoreType] = useState<StoreDepartment>(
    categories[0]?.store_type || "crockery"
  );
  const [material, setMaterial] = useState("Bone China");

  // Multi-image upload, Cloudinary Media Library & external URL state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [externalUrlInput, setExternalUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState<string | null>(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null
  );
  const [showCloudLibrary, setShowCloudLibrary] = useState(false);
  const [cloudLibraryLoading, setCloudLibraryLoading] = useState(false);
  const [cloudLibraryAssets, setCloudLibraryAssets] = useState<
    CloudinaryLibraryAsset[]
  >([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [dishwasherSafe, setDishwasherSafe] = useState(true);
  const [microwaveSafe, setMicrowaveSafe] = useState(true);
  const [ovenSafe, setOvenSafe] = useState(false);
  const [handwashOnly, setHandwashOnly] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [variants, setVariants] = useState<VariantFormRow[]>([
    {
      sku: "KK-NEW-01",
      title: "Standard Set",
      price: 8500,
      compare_at_price: 10500,
      stock: 25,
      piece_count: 6,
      weight_grams: 2200,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Quick stock/price inline editor
  const [quickEditVariantId, setQuickEditVariantId] = useState<string | null>(
    null
  );
  const [quickStock, setQuickStock] = useState<number>(0);
  const [quickPrice, setQuickPrice] = useState<number>(0);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    fetch("/api/admin/upload")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.configured && data?.cloudName) {
          setCloudinaryCloudName(data.cloudName);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openCreateModal();
    }
  }, [searchParams]);

  const loadCloudinaryLibrary = async () => {
    if (showCloudLibrary) {
      setShowCloudLibrary(false);
      return;
    }
    setShowCloudLibrary(true);
    setCloudLibraryLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/upload?library=1");
      const data = await res.json();
      if (data?.cloudName) {
        setCloudinaryCloudName(data.cloudName);
      }
      if (Array.isArray(data?.resources)) {
        setCloudLibraryAssets(data.resources);
      }
      if (data?.warning) {
        setFormError(data.warning);
      }
    } catch (err: any) {
      setFormError(err.message || "Could not load Cloudinary Media Library.");
    } finally {
      setCloudLibraryLoading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const openCreateModal = () => {
    setEditingProductId(null);
    setName("");
    setSlug("");
    setDescription("");
    setCategoryId(categories[0]?.id || "cat-dinner-sets");
    setMaterial("Bone China");
    setImageUrls([]);
    setExternalUrlInput("");
    setShowCloudLibrary(false);
    setDishwasherSafe(true);
    setMicrowaveSafe(true);
    setOvenSafe(false);
    setHandwashOnly(false);
    setIsFeatured(true);
    setIsPublished(true);
    setVariants([
      {
        sku: `KK-${Math.floor(100 + Math.random() * 900)}`,
        title: "Complete Set",
        price: 12500,
        compare_at_price: 15000,
        stock: 20,
        piece_count: 12,
        weight_grams: 3500,
      },
    ]);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setCategoryId(p.category_id);
    setMaterial(p.material);
    setImageUrls(p.images.map((img) => img.image_url));
    setExternalUrlInput("");
    setShowCloudLibrary(false);
    setDishwasherSafe(p.care_instructions.dishwasher_safe);
    setMicrowaveSafe(p.care_instructions.microwave_safe);
    setOvenSafe(p.care_instructions.oven_safe);
    setHandwashOnly(p.care_instructions.handwash_only);
    setIsFeatured(p.is_featured);
    setIsPublished(p.is_published);
    setVariants(
      p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price,
        stock: v.stock,
        piece_count: v.piece_count,
        weight_grams: v.weight_grams,
      }))
    );
    setFormError("");
    setIsModalOpen(true);
  };

  // Upload files from computer/phone via /api/admin/upload (Signed Cloudinary Upload)
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFormError("");
    setUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "almoin-crockery-products");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        if (data.cloudName) {
          setCloudinaryCloudName(data.cloudName);
        }
        uploadedUrls.push(data.url);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setFormError(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddExternalUrl = () => {
    const trimmed = externalUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setFormError("Please enter a valid https:// image URL or /uploads/... path.");
      return;
    }
    setFormError("");
    setImageUrls((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setExternalUrlInput("");
  };

  const handleSetPrimaryImage = (idx: number) => {
    if (idx === 0) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(idx, 1);
      copy.unshift(chosen);
      return copy;
    });
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariantRow = () => {
    setVariants([
      ...variants,
      {
        sku: `KK-${Math.floor(100 + Math.random() * 900)}`,
        title: `Option ${variants.length + 1}`,
        price: 6500,
        stock: 15,
        piece_count: 6,
        weight_grams: 1800,
      },
    ]);
  };

  const handleRemoveVariantRow = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (
    idx: number,
    field: keyof VariantFormRow,
    value: string | number
  ) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Include any URL typed in externalUrlInput even if user forgot to click "Add URL"
    const pendingUrl = externalUrlInput.trim();
    const combinedUrls =
      pendingUrl && !imageUrls.includes(pendingUrl)
        ? [...imageUrls, pendingUrl]
        : imageUrls;

    if (combinedUrls.length === 0) {
      setFormError(
        "Please upload at least one product photo or paste an image URL."
      );
      return;
    }

    setSaving(true);

    const res = await saveProductAction({
      id: editingProductId || undefined,
      name,
      slug,
      description,
      category_id: categoryId,
      store_type: storeType,
      material,
      image_url: combinedUrls[0],
      image_urls: combinedUrls,
      dishwasher_safe: dishwasherSafe,
      microwave_safe: microwaveSafe,
      oven_safe: ovenSafe,
      handwash_only: handwashOnly,
      is_featured: isFeatured,
      is_published: isPublished,
      variants,
    });

    setSaving(false);

    if (!res.success || !res.product) {
      setFormError(res.error || "Failed to save product.");
      return;
    }

    if (editingProductId) {
      setProducts(
        products.map((p) => (p.id === editingProductId ? res.product! : p))
      );
    } else {
      setProducts([res.product, ...products]);
    }

    setIsModalOpen(false);
  };

  const handleQuickSaveVariant = async (
    productId: string,
    variantId: string
  ) => {
    const res = await updateVariantStockPriceAction(
      productId,
      variantId,
      quickStock,
      quickPrice
    );
    if (res.success && res.product) {
      setProducts(
        products.map((p) => (p.id === productId ? res.product! : p))
      );
    }
    setQuickEditVariantId(null);
  };

  const handleToggleFlag = async (
    productId: string,
    field: "is_published" | "is_featured"
  ) => {
    const res = await toggleProductFlagAction(productId, field);
    if (res.success && res.product) {
      setProducts(
        products.map((p) => (p.id === productId ? res.product! : p))
      );
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    if (!window.confirm(`Delete "${productName}" from the catalog?`)) return;
    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "all" && p.category_id !== categoryFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Crockery Catalog &amp; Stock Matrix
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload product photos, edit PKR pricing, adjust warehouse stock, and manage SKU variants.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a
            href="/api/admin/export-csv"
            download="crockery-inventory.csv"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or material..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              categoryFilter === "all"
                ? "bg-amber-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products & Variants Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-stone-200">
            <thead className="bg-[#f8f5ef] font-semibold text-stone-600">
              <tr>
                <th className="py-3.5 px-4">Product &amp; Visibility</th>
                <th className="py-3.5 px-4">Material &amp; Care</th>
                <th className="py-3.5 px-4">
                  SKU Variants (Click to Quick-Edit Price / Stock)
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const catName =
                  categories.find((c) => c.id === p.category_id)?.name ||
                  "Tableware";

                return (
                  <tr key={p.id} className="hover:bg-amber-50/20 align-top">
                    {/* Product Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <Image
                            src={p.images[0]?.image_url || "/logo-card.jpg"}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-serif font-bold text-sm text-stone-900 hover:text-amber-800 inline-flex items-center gap-1"
                            >
                              {p.name}{" "}
                              <ExternalLink className="w-3 h-3 text-stone-400" />
                            </Link>
                          </div>
                          <span className="text-[11px] text-stone-500 block">
                            {catName} &bull;{" "}
                            <span className="font-mono">{p.slug}</span> &bull;{" "}
                            {p.images.length}{" "}
                            {p.images.length === 1 ? "photo" : "photos"}
                          </span>

                          {/* Quick Toggle Badges */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleFlag(p.id, "is_published")
                              }
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                                p.is_published
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-stone-100 border-stone-200 text-stone-500"
                              }`}
                              title="Toggle Published Status"
                            >
                              {p.is_published ? (
                                <>
                                  <Eye className="w-3 h-3" /> Published
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Hidden
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleFlag(p.id, "is_featured")
                              }
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                                p.is_featured
                                  ? "bg-amber-50 border-amber-300 text-amber-900"
                                  : "bg-stone-100 border-stone-200 text-stone-500"
                              }`}
                              title="Toggle Featured on Homepage"
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  p.is_featured
                                    ? "fill-amber-500 text-amber-500"
                                    : ""
                                }`}
                              />
                              {p.is_featured ? "Featured" : "Standard"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Material & Care */}
                    <td className="py-4 px-4 space-y-1.5">
                      <span className="inline-block font-semibold bg-amber-50 border border-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px]">
                        {p.material}
                      </span>
                      <div className="text-[11px] text-stone-500 space-y-0.5">
                        <div>
                          Dishwasher:{" "}
                          <strong className="text-stone-700">
                            {p.care_instructions.dishwasher_safe
                              ? "Safe"
                              : "Handwash"}
                          </strong>
                        </div>
                        <div>
                          Microwave:{" "}
                          <strong className="text-stone-700">
                            {p.care_instructions.microwave_safe
                              ? "Safe"
                              : "No (Gold Trim)"}
                          </strong>
                        </div>
                      </div>
                    </td>

                    {/* Variants Matrix */}
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        {p.variants.map((v) => {
                          const isEditingThis = quickEditVariantId === v.id;
                          return (
                            <div
                              key={v.id}
                              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3"
                            >
                              <div>
                                <span className="font-semibold text-stone-900">
                                  {v.title}
                                </span>{" "}
                                <span className="text-[10px] font-mono text-stone-500">
                                  ({v.sku} &bull; {v.piece_count} pcs)
                                </span>
                              </div>

                              {isEditingThis ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-stone-500">
                                      PKR:
                                    </span>
                                    <input
                                      type="number"
                                      value={quickPrice}
                                      onChange={(e) =>
                                        setQuickPrice(Number(e.target.value))
                                      }
                                      className="w-20 p-1 text-xs border border-stone-300 rounded bg-white"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-stone-500">
                                      Stock:
                                    </span>
                                    <input
                                      type="number"
                                      value={quickStock}
                                      onChange={(e) =>
                                        setQuickStock(Number(e.target.value))
                                      }
                                      className="w-16 p-1 text-xs border border-stone-300 rounded bg-white"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuickSaveVariant(p.id, v.id)
                                    }
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuickEditVariantId(null)}
                                    className="p-1 bg-stone-200 text-stone-700 rounded hover:bg-stone-300 cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="font-serif font-bold text-sm text-stone-900">
                                    {formatPKR(v.price)}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      v.stock > 20
                                        ? "bg-emerald-100 text-emerald-800"
                                        : v.stock > 5
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {v.stock} in stock
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickEditVariantId(v.id);
                                      setQuickPrice(v.price);
                                      setQuickStock(v.stock);
                                    }}
                                    className="text-[11px] text-amber-800 hover:underline font-medium cursor-pointer"
                                  >
                                    Quick Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-amber-700 text-stone-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:border-red-300 text-stone-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {editingProductId
                      ? "Edit Crockery Product"
                      : "Add New Crockery Product"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload photos from your device or paste a cloud image URL.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-stone-700 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Lahore 24-Piece Bone China Dinner Set"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Store Department *
                  </label>
                  <select
                    value={storeType}
                    onChange={(e) => {
                      const next = e.target.value as StoreDepartment;
                      setStoreType(next);
                      const deptMeta = STORE_DEPARTMENTS.find((d) => d.id === next);
                      if (deptMeta && !deptMeta.materials.includes(material)) {
                        setMaterial(deptMeta.materials[0]);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    {STORE_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Category / Sub-Collection *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setCategoryId(cid);
                      const matchedCat = categories.find((c) => c.id === cid);
                      if (matchedCat?.store_type) {
                        setStoreType(matchedCat.store_type);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Material / Fabric *
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    {MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Photos: Direct Signed Cloudinary Upload + Media Library + URL */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-semibold text-stone-700">
                      Product Photos * (Uploads directly to Cloudinary &amp; saves URL to DB)
                    </label>
                    <div className="flex items-center gap-2">
                      {cloudinaryCloudName && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                          <Cloud className="w-3 h-3" /> Cloudinary Connected ({cloudinaryCloudName})
                        </span>
                      )}
                      {cloudinaryCloudName && (
                        <button
                          type="button"
                          onClick={loadCloudinaryLibrary}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-stone-300 bg-white hover:border-amber-700 text-stone-700 text-[11px] font-semibold cursor-pointer"
                        >
                          <FolderOpen className="w-3 h-3 text-amber-700" />
                          {showCloudLibrary ? "Hide Cloud Library" : "Browse Cloudinary"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Drag & Drop / File Picker Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                      dragActive
                        ? "border-amber-600 bg-amber-50/70"
                        : "border-stone-300 bg-stone-50 hover:border-amber-600 hover:bg-amber-50/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                      multiple
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-2 text-amber-800">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-semibold">
                          Uploading to Cloudinary ({cloudinaryCloudName || "CDN"})...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-amber-700 shadow-2xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="font-semibold text-stone-800">
                          Click to upload photo(s) to Cloudinary or drag &amp; drop
                        </p>
                        <p className="text-[11px] text-stone-400">
                          JPG, PNG, WebP, or AVIF up to 10MB &bull; Generates permanent Cloudinary HTTPS URLs
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Optional Cloudinary Media Library Drawer */}
                  {showCloudLibrary && (
                    <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-700">
                          Cloudinary Media Library ({cloudinaryCloudName}) — Click an image to attach
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCloudLibrary(false)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                      {cloudLibraryLoading ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-stone-500">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading Cloudinary assets...
                        </div>
                      ) : cloudLibraryAssets.length === 0 ? (
                        <p className="text-[11px] text-stone-500 py-3 text-center">
                          No images found in your Cloudinary library yet. Upload a photo above!
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                          {cloudLibraryAssets.map((asset) => {
                            const selected = imageUrls.includes(asset.url);
                            return (
                              <button
                                key={asset.publicId}
                                type="button"
                                onClick={() =>
                                  setImageUrls((prev) =>
                                    prev.includes(asset.url)
                                      ? prev
                                      : [...prev, asset.url]
                                  )
                                }
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                                  selected
                                    ? "border-emerald-600 ring-2 ring-emerald-500/20"
                                    : "border-stone-200 hover:border-amber-600"
                                }`}
                                title={asset.publicId}
                              >
                                <Image
                                  src={asset.url}
                                  alt={asset.publicId}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                                {selected && (
                                  <span className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* External Cloud Image URL Input */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={externalUrlInput}
                        onChange={(e) => setExternalUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddExternalUrl();
                          }
                        }}
                        placeholder="Or paste an existing https://res.cloudinary.com/... URL"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExternalUrl}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:border-amber-700 text-stone-700 font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5" /> Add URL
                    </button>
                  </div>

                  {/* Live Thumbnail Gallery Preview + Stored DB URLs */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {imageUrls.map((url, idx) => (
                          <div
                            key={`${url}-${idx}`}
                            className={`relative group rounded-xl overflow-hidden border-2 bg-stone-100 aspect-square ${
                              idx === 0
                                ? "border-amber-600 ring-2 ring-amber-600/20"
                                : "border-stone-200"
                            }`}
                          >
                            <Image
                              src={url}
                              alt={`Preview ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="120px"
                            />

                            {idx === 0 ? (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[9px] font-bold uppercase">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/95 text-stone-800 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-stone-900/75 text-white hover:bg-red-600 transition cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Generated Cloudinary URLs saved to SQLite */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">
                          Image URLs Stored in Database ({imageUrls.length})
                        </span>
                        {imageUrls.map((url, idx) => (
                          <div
                            key={`url-row-${idx}`}
                            className="flex items-center justify-between gap-2 text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70"
                          >
                            <span className="font-mono text-stone-600 truncate">
                              {url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(url)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 hover:text-amber-950 shrink-0 cursor-pointer"
                              title="Copy image URL"
                            >
                              {copiedUrl === url ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy URL
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-stone-700 block mb-1">
                    Description &amp; Craft Notes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the glaze finish, piece composition, and dining occasion..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Care & Visibility Checkboxes */}
              <div className="p-4 rounded-2xl bg-[#f8f5ef] border border-stone-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishwasherSafe}
                    onChange={(e) => setDishwasherSafe(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Dishwasher Safe</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={microwaveSafe}
                    onChange={(e) => setMicrowaveSafe(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Microwave Safe</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ovenSafe}
                    onChange={(e) => setOvenSafe(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Oven Safe</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={handwashOnly}
                    onChange={(e) => setHandwashOnly(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Handwash Recommended</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Published on Storefront</span>
                </label>
              </div>

              {/* SKU Variants Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-base text-stone-900">
                    SKU Variants, Set Sizes &amp; PKR Pricing
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Set Option / Variant
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
                    >
                      <div className="col-span-2 sm:col-span-2">
                        <label className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                          Option Title (e.g. 24-Piece Set)
                        </label>
                        <input
                          type="text"
                          required
                          value={v.title}
                          onChange={(e) =>
                            handleVariantChange(idx, "title", e.target.value)
                          }
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                          SKU Code
                        </label>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) =>
                            handleVariantChange(idx, "sku", e.target.value)
                          }
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                          Price (PKR)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={v.price}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "price",
                              Number(e.target.value)
                            )
                          }
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                          Stock Units
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={v.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                            Pieces
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={v.piece_count}
                            onChange={(e) =>
                              handleVariantChange(
                                idx,
                                "piece_count",
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold shadow-sm cursor-pointer"
                >
                  {saving
                    ? "Saving to Catalog..."
                    : editingProductId
                    ? "Save Changes"
                    : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
