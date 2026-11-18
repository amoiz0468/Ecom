"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Category, StoreDepartment } from "@/types";
import { STORE_DEPARTMENTS } from "@/lib/data/constants";
import { saveCategoryAction, deleteCategoryAction } from "@/lib/admin/actions";
import { Plus, Trash2, Pencil, Layers, Upload, Loader2 } from "lucide-react";

export function AdminCategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [storeType, setStoreType] = useState<StoreDepartment>("crockery");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(initialCategories.length + 1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleCategoryImageUpload = async (file?: File | null) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "almoin-crockery-categories");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload category photo.");
      }
      setImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Category image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setStoreType("crockery");
    setDescription("");
    setImageUrl("");
    setDisplayOrder(categories.length + 1);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setStoreType(cat.store_type || "crockery");
    setDescription(cat.description || "");
    setImageUrl(cat.image_url || "");
    setDisplayOrder(cat.display_order);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await saveCategoryAction({
      id: editingId || undefined,
      name,
      slug,
      store_type: storeType,
      description,
      image_url: imageUrl,
      display_order: displayOrder,
    });
    setSaving(false);
    if (res.success) {
      setCategories(res.categories);
      resetForm();
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete department "${catName}"?`)) return;
    const res = await deleteCategoryAction(id);
    if (res.success) {
      setCategories(res.categories);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Form: Add / Edit Department */}
      <div className="lg:col-span-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 border border-stone-200/90 space-y-4 text-xs shadow-2xs sticky top-24"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Layers className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {editingId ? "Edit Department" : "Add New Department"}
            </h3>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Store Department *
            </label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value as StoreDepartment)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bridal Tea Sets"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              URL Slug (Optional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. bridal-tea-sets"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700">
                Cover Image (Cloudinary or URL)
              </label>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" /> Upload Photo
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={(e) => handleCategoryImageUpload(e.target.files?.[0])}
                className="hidden"
              />
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-[11px]"
            />

            {uploadError && (
              <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
            )}

            {imageUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <Image
                  src={imageUrl}
                  alt="Category preview"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown on collection cards..."
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-24 p-2 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Grid: Existing Categories */}
      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-4 border border-stone-200/90 flex gap-4 items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image
                    src={cat.image_url || "/logo-card.jpg"}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-amber-800 font-semibold">
                    Order #{cat.display_order}
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-900 truncate">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] font-mono text-stone-400 block">
                    /shop?category={cat.slug}
                  </span>
                  {cat.description && (
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2 rounded-lg border border-stone-200 hover:border-amber-700 text-stone-600 hover:text-amber-800 transition"
                  title="Edit Category"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 rounded-lg border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-600 transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

