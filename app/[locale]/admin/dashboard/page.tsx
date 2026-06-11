'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, LogOut, Edit, Trash2, Upload, X, Package, GalleryHorizontal, PackageOpen, Loader2, Check, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Image as IKImage, ImageKitProvider } from '@imagekit/react';
import { getAdminImageUrl } from '@/lib/imagekit';
import { useLocale } from 'next-intl';
import DashboardLanguageSwitcher from '@/components/DashboardLanguageSwitcher';
import ColorPicker from '@/components/ColorPicker';
import CarouselManagement from '@/components/CarouselManagement';
import { type MenuItem } from '@/lib/db';
import { CATEGORIES, getCategoriesExcludingAll } from '@/lib/categories';

function normalizeSizes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((size) => String(size).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<'menu' | 'carousel'>('menu');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ckb: '',
    name_arb: '',
    description_en: '',
    description_ckb: '',
    description_arb: '',
    sizes: [] as string[],
    colors: ['#E2E8F0'] as string[],
    newSize: '',
    image_url: '',
    image_file_name: '',
    category: '',
    is_sold_out: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push(`/${locale}/login`);
    } else {
      setAuthenticated(true);
      fetchItems();
    }
    setLoading(false);
  }, [router, locale]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        console.error('Error fetching items: HTTP', response.status);
        setItems([]);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error('Error: API did not return an array', data);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('adminAuth');
    router.push(`/${locale}/login`);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'image_file' && files && files[0]) {
      const file = files[0];
      try {
        setMessage('وێنە بارکرادەكە...');
        setMessageType('success');
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Upload failed');
        }

        if (!uploadData.filePath) {
          throw new Error('No file path returned from upload');
        }

        setFormData((prev) => ({
          ...prev,
          image_url: uploadData.filePath,
          image_file_name: file.name,
        }));
        
        setMessage('وێنە بسەرکەوتوویی بارکرا ✅');
        setMessageType('success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Upload error:', errorMessage);
        setMessage(`هەڵە: ${errorMessage}`);
        setMessageType('error');
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addSize = () => {
    if (formData.newSize.trim()) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, prev.newSize.trim()],
        newSize: '',
      }));
    }
  };

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const toggleSoldOut = () => {
    setFormData((prev) => ({
      ...prev,
      is_sold_out: !prev.is_sold_out
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (!formData.name_en || !formData.name_ckb || !formData.name_arb) {
        setMessage('براکو ناو (ئینگلێزی، کوردی و عەرەبی) پڕ بکە');
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      if (!formData.image_url) {
        setMessage('براکو وێنەیەک بسووڕینەوە');
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name_en: formData.name_en,
          name_ckb: formData.name_ckb,
          name_arb: formData.name_arb,
          description_en: formData.description_en,
          description_ckb: formData.description_ckb,
          description_arb: formData.description_arb,
          sizes: formData.sizes,
          colors: formData.colors,
          price: '',
          image_url: formData.image_url,
          category: formData.category,
          is_sold_out: formData.is_sold_out,
        }),
      });

      if (response.ok) {
        setMessage('کاڵا بەسەرکەوتوویی زیادکرا!');
        setMessageType('success');
        resetForm();
        setShowAddModal(false);
        fetchItems();
      } else {
        const responseData = await response.json();
        setMessage(`هەڵە: ${responseData?.error || 'کاڵا زیاد نەکرا'}`);
        setMessageType('error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`هەڵە: ${errorMessage}`);
      setMessageType('error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/menu/${deleteId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('کاڵا سڕایەوە!');
        setMessageType('success');
        fetchItems();
      } else {
        setMessage('هەڵە لە سڕینەوەدا');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('هەڵە لە سڕینەوەدا');
      setMessageType('error');
      console.error('Delete error:', error);
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  const normalizeColors = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter(color => typeof color === 'string' && color.trim() !== '');
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter(color => typeof color === 'string' && color.trim() !== '');
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingId(item.id || null);
    setFormData({
      name_en: item.name_en || '',
      name_ckb: item.name_ckb || '',
      name_arb: item.name_arb || '',
      description_en: (item as any).description_en || '',
      description_ckb: (item as any).description_ckb || '',
      description_arb: (item as any).description_arb || '',
      sizes: normalizeSizes((item as any).sizes),
      colors: normalizeColors((item as any).colors),
      newSize: '',
      image_url: item.image_url,
      image_file_name: '',
      category: item.category || '',
      is_sold_out: (item as any).is_sold_out || false,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/menu/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name_en: formData.name_en,
          name_ckb: formData.name_ckb,
          name_arb: formData.name_arb,
          description_en: formData.description_en,
          description_ckb: formData.description_ckb,
          description_arb: formData.description_arb,
          colors: formData.colors,
          sizes: formData.sizes,
          price: '',
          image_url: formData.image_url,
          category: formData.category,
          is_sold_out: formData.is_sold_out,
        }),
      });

      if (response.ok) {
        setMessage('کاڵا نوێکراوە!');
        setMessageType('success');
        resetForm();
        setShowEditModal(false);
        setEditingId(null);
        fetchItems();
      } else {
        setMessage('هەڵە لە نوێکردنەوەدا');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('هەڵە لە نوێکردنەوەدا');
      setMessageType('error');
      console.error('Edit error:', error);
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ckb: '',
      name_arb: '',
      description_en: '',
      description_ckb: '',
      description_arb: '',
      sizes: [],
      colors: ['#E2E8F0'],
      newSize: '',
      image_url: '',
      image_file_name: '',
      category: '',
      is_sold_out: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-gray-400 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">چاوەڕێ بکە...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
      <div className="min-h-screen bg-gray-50">

        {/* ── Sticky Header ── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="w-9 h-9 md:w-11 md:h-11 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src="/image/logo.jpeg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-2xl font-bold text-gray-900 leading-tight truncate">
                  داشبۆردی ئەدمین
                </h1>
                <p className="text-[10px] md:text-xs text-gray-400 hidden sm:block">G-Glass Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-3 py-2 text-xs md:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">چوونەدەرەوە</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 md:px-8 py-6">

          {/* ── Tab Navigation ── */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1 w-fit">
            <button
              onClick={() => setCurrentSection('menu')}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-200 ${
                currentSection === 'menu'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4" /> مینیوو
            </button>
            <button
              onClick={() => setCurrentSection('carousel')}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-200 ${
                currentSection === 'carousel'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GalleryHorizontal className="w-4 h-4" /> کارۆسێل
            </button>
          </div>

          {/* ── Menu Section ── */}
          {currentSection === 'menu' && (
            <>
              {/* Stats bar */}
              <div className="mb-5 flex items-center gap-3">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    کۆی کاڵاکان:
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg">
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 pb-24 md:pb-6">
                {items.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-base font-medium">هیچ کاڵایەک بەردەست نییە!</p>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const hasNameArb = !!item.name_arb;
                    const hasCategory = !!item.category;
                    const itemSizes = normalizeSizes((item as any).sizes);
                    const itemColors = normalizeColors((item as any).colors);
                    
                    return (
                      <div
                        key={item.id || idx}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col border border-gray-100 group"
                      >
                        <div className="relative overflow-hidden">
                          <IKImage
                            src={getAdminImageUrl(item.image_url)}
                            alt={item.name_en}
                            width={300}
                            height={200}
                            className="w-full h-36 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {(item as any).is_sold_out && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                              نەماوە
                            </div>
                          )}
                          {hasCategory && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {item.category}
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-sm sm:text-base text-gray-900 truncate">{item.name_en}</p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-600 mb-2 truncate">{item.name_ckb}</p>
                            {itemSizes.length > 0 && (
                              <div className="mb-2 flex flex-wrap gap-1">
                                {itemSizes.slice(0, 4).map((size) => (
                                  <span
                                    key={size}
                                    className="rounded-lg bg-gray-100 px-2 py-0.5 text-center text-[10px] font-bold text-gray-600 border border-gray-200"
                                  >
                                    {size}
                                  </span>
                                ))}
                                {itemSizes.length > 4 && (
                                  <span className="text-[10px] text-gray-400 font-medium self-center">+{itemSizes.length - 4}</span>
                                )}
                              </div>
                            )}
                            {itemColors.length > 0 && (
                              <div className="mb-2 flex gap-1.5 flex-wrap">
                                {itemColors.slice(0, 6).map((color) => (
                                  <div
                                    key={color}
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white rounded-xl p-2 transition-all duration-200 flex items-center justify-center gap-1 font-semibold text-[11px] sm:text-xs shadow-sm hover:shadow-md"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              گۆڕین
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded-xl p-2 transition-all duration-200 flex items-center justify-center gap-1 font-semibold text-[11px] sm:text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              سڕینەوە
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Carousel Section */}
          {currentSection === 'carousel' && (
            <CarouselManagement />
          )}
        </div>

        {/* ── Floating Action Button (FAB) - Always visible when in menu section ── */}
        {currentSection === 'menu' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:left-auto md:translate-x-0 md:right-8 md:bottom-8">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 active:scale-95 text-white rounded-2xl px-5 py-3.5 font-bold text-sm transition-all duration-200 group"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-4 h-4" />
              </span>
              زیادکردنی کاڵای نوێ
            </button>
          </div>
        )}

        {/* ── Add Product Dialog ── */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-[95vw] lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto p-5 md:p-6 rounded-[24px]">
            <DialogHeader className="pb-3 border-b border-gray-100 mb-4">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2 flex justify-center">
                <span className="p-1.5 bg-gray-100 rounded-xl">
                  <Plus className="w-4 h-4 text-gray-700" />
                </span>
                زیادکردنی کاڵای نوێ
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Form Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Names – 3 cols */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">زانیاری سەرەکی کاڵا</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="name_en" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          English *
                        </label>
                        <input
                          id="name_en"
                          type="text"
                          name="name_en"
                          value={formData.name_en}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-955 bg-white transition placeholder:text-gray-300"
                          placeholder="English name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="name_ckb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Kurdish *
                        </label>
                        <input
                          id="name_ckb"
                          type="text"
                          name="name_ckb"
                          value={formData.name_ckb}
                          onChange={handleInputChange}
                          placeholder="ناوی کاڵا"
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-sm transition placeholder:text-gray-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="name_arb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Arabic *
                        </label>
                        <input
                          id="name_arb"
                          type="text"
                          name="name_arb"
                          value={formData.name_arb}
                          onChange={handleInputChange}
                          placeholder="اسم المنتج"
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-sm transition placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descriptions – 3 cols */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">وەسفی کاڵا (کورتە)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="description_en" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. EN
                        </label>
                        <textarea
                          id="description_en"
                          name="description_en"
                          value={formData.description_en}
                          onChange={handleInputChange}
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                      <div>
                        <label htmlFor="description_ckb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. KU
                        </label>
                        <textarea
                          id="description_ckb"
                          name="description_ckb"
                          value={formData.description_ckb}
                          onChange={handleInputChange}
                          placeholder="وەسف"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                      <div>
                        <label htmlFor="description_arb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. AR
                        </label>
                        <textarea
                          id="description_arb"
                          name="description_arb"
                          value={formData.description_arb}
                          onChange={handleInputChange}
                          placeholder="الوصف"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sizes and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        سایزە بەردەستەکان
                      </label>
                      <div className="flex gap-1 mb-1.5 flex-wrap min-h-[28px]">
                        {formData.sizes.length === 0 ? (
                          <span className="text-[11px] text-gray-400 italic">هیچ سایزێک زیادنەکراوە</span>
                        ) : (
                          formData.sizes.map((size, index) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              <span className="text-xs text-gray-700 font-medium">{size}</span>
                              <button
                                type="button"
                                onClick={() => removeSize(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          name="newSize"
                          value={formData.newSize}
                          onChange={handleInputChange}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); }}}
                          placeholder="سایز (نموونە: 40x40)"
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 transition"
                        />
                        <button
                          type="button"
                          onClick={addSize}
                          className="bg-gray-900 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-1">
                        بەشی کاڵا *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 transition"
                      >
                        <option value="">هەڵبژاردنی بەشەکان</option>
                        {getCategoriesExcludingAll().map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label_ckb}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Media, Status, Submission (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Colors Selection */}
                    <div>
                      <ColorPicker 
                        colors={formData.colors} 
                        onChange={(newColors) => setFormData((prev) => ({ ...prev, colors: newColors }))}
                        maxColors={6}
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        وێنەی کاڵا
                      </label>
                      <div className="relative">
                        <input
                          id="image_file"
                          type="file"
                          name="image_file"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full px-4 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex items-center gap-2.5 justify-center text-xs ${
                          formData.image_file_name 
                            ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' 
                            : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 text-gray-500'
                        }`}>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-gray-700">
                              {formData.image_file_name ? 'وێنەکە هەڵبژێردرا' : 'وێنەی کاڵا زیادبکە'}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              {formData.image_file_name ? formData.image_file_name : 'کلیک بکە بۆ دیاریکردنی وێنە'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.image_url && (
                        <div className="mt-2.5 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group h-28">
                          <IKImage
                            src={getAdminImageUrl(formData.image_url)}
                            alt="Preview"
                            width={400}
                            height={112}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </div>

                    {/* Sold Out Switch Card */}
                    <div className="flex items-center justify-between gap-4 py-2.5 bg-gray-50/50 px-4 rounded-2xl border border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700">نەماوە (Sold Out)</span>
                        <span className="text-[10px] text-gray-400">نیشاندانی کاڵاکە وەک نەماوە لە فرۆشگا</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleSoldOut}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          formData.is_sold_out ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            formData.is_sold_out ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Message Alert and Actions */}
                  <div className="pt-2 space-y-3">
                    {message && (
                      <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                        messageType === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                          setMessage('');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-4 rounded-xl border-0 shadow-none flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        لابردن
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 transition font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            زیادکردن...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            زیادکردن
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>

                </div>

              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Edit Product Dialog ── */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-[95vw] lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto p-5 md:p-6 rounded-[24px]">
            <DialogHeader className="pb-3 border-b border-gray-100 mb-4">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-gray-100 rounded-xl">
                  <Edit className="w-4 h-4 text-gray-700" />
                </span>
                گۆڕینی کاڵا
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Form Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Names – 3 cols */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">زانیاری سەرەکی کاڵا</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="edit-name_en" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          English *
                        </label>
                        <input
                          id="edit-name_en"
                          type="text"
                          name="name_en"
                          value={formData.name_en}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white transition placeholder:text-gray-300"
                          placeholder="English name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-name_ckb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Kurdish *
                        </label>
                        <input
                          id="edit-name_ckb"
                          type="text"
                          name="name_ckb"
                          value={formData.name_ckb}
                          onChange={handleInputChange}
                          placeholder="ناوی کاڵا"
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-sm transition placeholder:text-gray-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-name_arb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Arabic *
                        </label>
                        <input
                          id="edit-name_arb"
                          type="text"
                          name="name_arb"
                          value={formData.name_arb}
                          onChange={handleInputChange}
                          placeholder="اسم المنتج"
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-sm transition placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descriptions – 3 cols */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">وەسفی کاڵا (کورتە)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="edit-description_en" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. EN
                        </label>
                        <textarea
                          id="edit-description_en"
                          name="description_en"
                          value={formData.description_en}
                          onChange={handleInputChange}
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description_ckb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. KU
                        </label>
                        <textarea
                          id="edit-description_ckb"
                          name="description_ckb"
                          value={formData.description_ckb}
                          onChange={handleInputChange}
                          placeholder="وەسف"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description_arb" className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Desc. AR
                        </label>
                        <textarea
                          id="edit-description_arb"
                          name="description_arb"
                          value={formData.description_arb}
                          onChange={handleInputChange}
                          placeholder="الوصف"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 text-xs transition resize-none placeholder:text-gray-300"
                          rows={2.5}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sizes and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        سایزە بەردەستەکان
                      </label>
                      <div className="flex gap-1 mb-1.5 flex-wrap min-h-[28px]">
                        {formData.sizes.length === 0 ? (
                          <span className="text-[11px] text-gray-400 italic">هیچ سایزێک زیادنەکراوە</span>
                        ) : (
                          formData.sizes.map((size, index) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              <span className="text-xs text-gray-700 font-medium">{size}</span>
                              <button
                                type="button"
                                onClick={() => removeSize(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          name="newSize"
                          value={formData.newSize}
                          onChange={handleInputChange}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); }}}
                          placeholder="سایز (نموونە: 40x40)"
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 transition"
                        />
                        <button
                          type="button"
                          onClick={addSize}
                          className="bg-gray-900 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-category" className="block text-xs font-semibold text-gray-700 mb-1">
                        بەشی کاڵا *
                      </label>
                      <select
                        id="edit-category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-955 focus:ring-1 focus:ring-gray-955 bg-white text-gray-900 transition"
                      >
                        <option value="">هەڵبژاردنی بەشەکان</option>
                        {getCategoriesExcludingAll().map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label_ckb}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Media, Status, Submission (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Colors Selection */}
                    <div>
                      <ColorPicker 
                        colors={formData.colors} 
                        onChange={(newColors) => setFormData((prev) => ({ ...prev, colors: newColors }))}
                        maxColors={6}
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        وێنەی کاڵا
                      </label>
                      <div className="relative">
                        <input
                          id="edit-image"
                          type="file"
                          name="image_file"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full px-4 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex items-center gap-2.5 justify-center text-xs ${
                          formData.image_file_name 
                            ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' 
                            : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 text-gray-500'
                        }`}>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-gray-700">
                              {formData.image_file_name ? 'وێنەکە گۆڕدرا' : 'وێنەیەک هەڵبژێرە'}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              {formData.image_file_name ? formData.image_file_name : 'کلیک بکە بۆ گۆڕینی فایل'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.image_url && (
                        <div className="mt-2.5 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group h-28">
                          <IKImage
                            src={getAdminImageUrl(formData.image_url)}
                            alt="Preview"
                            width={400}
                            height={112}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </div>

                    {/* Sold Out Switch Card */}
                    <div className="flex items-center justify-between gap-4 py-2.5 bg-gray-50/50 px-4 rounded-2xl border border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700">نەماوە (Sold Out)</span>
                        <span className="text-[10px] text-gray-400">نیشاندانی کاڵاکە وەک نەماوە لە فرۆشگا</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleSoldOut}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          formData.is_sold_out ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            formData.is_sold_out ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Message Alert and Actions */}
                  <div className="pt-2 space-y-3">
                    {message && (
                      <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                        messageType === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingId(null);
                          resetForm();
                          setMessage('');
                          setMessageType('success');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-4 rounded-xl border-0 shadow-none flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        هەڵوەشاندنەوە
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 transition font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            نوێکردن...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            نوێکردنەوە
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>

                </div>

              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[380px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-base flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" /> سڕینەوەی کاڵا
              </DialogTitle>
              <DialogDescription className="text-center text-sm mt-1">
                ئایە دڵنیایت لە سڕینەوەی ئەم کاڵایە؟
              </DialogDescription>
            </DialogHeader>

            {message && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <DialogFooter className="gap-2 mt-2">
              <Button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteId(null);
                  setMessage('');
                  setMessageType('success');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border-0 shadow-none flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                هەڵوەشاندن
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                بەڵێ، بیسڕەوە
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </ImageKitProvider>
  );
}
