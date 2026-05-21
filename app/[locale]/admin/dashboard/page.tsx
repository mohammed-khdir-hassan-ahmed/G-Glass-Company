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
import { Plus, LogOut, Edit, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Image as IKImage, ImageKitProvider } from '@imagekit/react';
import { getAdminImageUrl } from '@/lib/imagekit';
import { useLocale } from 'next-intl';
import DashboardLanguageSwitcher from '@/components/DashboardLanguageSwitcher';
import ColorPicker from '@/components/ColorPicker';
import { type MenuItem } from '@/lib/db';
import { CATEGORIES } from '@/lib/categories';

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
    colors: [] as string[],
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
        
        console.log('📤 Starting server-side upload...');
        console.log('  File:', file.name, '(' + file.size + ' bytes)');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('📥 Upload response status:', uploadRes.status);
        const uploadData = await uploadRes.json();
        console.log('📥 Upload response:', uploadData);

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
        setMessage('خواردن بسەرکەوتوویی زیادکرا!');
        setMessageType('success');
        resetForm();
        setShowAddModal(false);
        fetchItems();
      } else {
        const responseData = await response.json();
        setMessage(`هەڵە: ${responseData?.error || 'خواردن زیاد نەکرا'}`);
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
        setMessage('خواردن سڕایەوە!');
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
        setMessage('خواردن نوێکراوە!');
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
      colors: [],
      newSize: '',
      image_url: '',
      image_file_name: '',
      category: '',
      is_sold_out: false,
    });
  };

  if (loading) {
    return <div>Loading.</div>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
      <div className="min-h-screen bg-white">
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <Image
                src="/image/image.png"
                alt="Logo"
                width={50}
                height={50}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#000000]">داشبۆردی ئەدمین</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              className="bg-[#000000] hover:bg-zinc-800 text-white rounded-lg px-4 py-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              چوونەدەرەوە
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="w-full mb-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-[#000000] hover:bg-zinc-800 text-white rounded-lg px-6 py-3 font-bold flex items-center gap-2 w-full md:w-auto md:ml-auto"
          >
            <Plus className="w-5 h-5" />
            زیادکردنی کاڵای نوێ
          </Button>
        </div>

        <div className="w-full mb-4 flex justify-center">
          <h2 className="text-xl font-bold text-gray-800">
            ژمارەی کاڵاکان : <span className="text-[#000000]">{items.length}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 text-lg">هیچ کاڵایەک بەردەست نییە!</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const hasNameArb = !!item.name_arb;
              const hasCategory = !!item.category;
              const itemSizes = normalizeSizes((item as any).sizes);
              const itemColors = normalizeColors((item as any).colors);
              
              return (
                <div key={item.id || idx} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col m-1 border border-gray-100">
                  <div className="relative">
                    <IKImage
                      src={getAdminImageUrl(item.image_url)}
                      alt={item.name_en}
                      width={300}
                      height={200}
                      className="w-full h-36 sm:h-44 object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-base sm:text-lg text-gray-900 truncate">{item.name_en}</p>
                      <p className="font-bold text-sm sm:text-base text-gray-700 mb-1 sm:mb-2 truncate">{item.name_ckb}</p>
                      {hasNameArb && (
                        <p className="font-bold text-sm sm:text-base text-gray-700 mb-1 sm:mb-2 truncate">{item.name_arb}</p>
                      )}
                      {itemSizes.length > 0 && (
                        <div className="mb-2 sm:mb-3 space-y-1">
                          {itemSizes.reduce((rows: string[][], size, index) => {
                            const rowIndex = Math.floor(index / 2);
                            if (!rows[rowIndex]) rows[rowIndex] = [];
                            rows[rowIndex].push(size);
                            return rows;
                          }, []).map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-2">
                              {row.map((size) => (
                                <span
                                  key={size}
                                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-center text-xs font-bold text-gray-700"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      {itemColors.length > 0 && (
                        <div className="mb-2 sm:mb-3 flex gap-2 flex-wrap">
                          {itemColors.map((color) => (
                            <div
                              key={color}
                              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                      {hasCategory && (
                        <p className="text-xs text-gray-500 mb-2 sm:mb-3">بەش: {item.category}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        گۆڕین
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        سڕینەوە
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>


      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="lg:max-w-5xl max-h-[80vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">زیادکردنی کاڵای نوێ</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label htmlFor="name_en" className="block text-xs font-semibold text-gray-700 mb-1">
                  ناوی کاڵا (English) *
                </label>
                <input
                  id="name_en"
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#000000]"
                  placeholder="English name"
                  required
                />
              </div>
              <div>
                <label htmlFor="name_ckb" className="block text-xs font-semibold text-gray-700 mb-1">
                  ناوی کاڵا (Kurdish) *
                </label>
                <input
                  id="name_ckb"
                  type="text"
                  name="name_ckb"
                  value={formData.name_ckb}
                  onChange={handleInputChange}
                  placeholder="ناوی کاڵا"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900 text-sm"
                />
              </div>
              <div>
                <label htmlFor="name_arb" className="block text-xs font-semibold text-gray-700 mb-1">
                  ناوی کاڵا (Arabic) *
                </label>
                <input
                  id="name_arb"
                  type="text"
                  name="name_arb"
                  value={formData.name_arb}
                  onChange={handleInputChange}
                  placeholder="اسم المنتج"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label htmlFor="description_en" className="block text-xs font-semibold text-gray-700 mb-1">
                  وەسف (English)
                </label>
                <textarea
                  id="description_en"
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900 text-xs"
                  rows={2}
                />
              </div>
              <div>
                <label htmlFor="description_ckb" className="block text-xs font-semibold text-gray-700 mb-1">
                  وەسف (Kurdish)
                </label>
                <textarea
                  id="description_ckb"
                  name="description_ckb"
                  value={formData.description_ckb}
                  onChange={handleInputChange}
                  placeholder="وەسف"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900 text-xs"
                  rows={2}
                />
              </div>
              <div>
                <label htmlFor="description_arb" className="block text-xs font-semibold text-gray-700 mb-1">
                  وەسف (Arabic)
                </label>
                <textarea
                  id="description_arb"
                  name="description_arb"
                  value={formData.description_arb}
                  onChange={handleInputChange}
                  placeholder="الوصف"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900 text-xs"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  سایز
                </label>
                <div className="flex gap-1 mb-1 flex-wrap">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-0.5 bg-gray-100 px-2 py-0.5 rounded-full">
                      <span className="text-xs text-gray-700">{size}</span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    name="newSize"
                    value={formData.newSize}
                    onChange={handleInputChange}
                    placeholder="سایز"
                    className="flex-1 px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                  />
                  <Button
                    type="button"
                    onClick={addSize}
                    className="bg-[#000000] hover:bg-[#1a1a1a] text-white text-xs px-2 py-1"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-1">
                  بەشەکان
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                >
                  <option value="">هەڵبژاردنی بەشەکان</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label_ckb}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <ColorPicker 
                  colors={formData.colors} 
                  onChange={(newColors) => setFormData((prev) => ({ ...prev, colors: newColors }))}
                  maxColors={6}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  وێنە
                </label>
                <div className="relative">
                  <input
                    id="image_file"
                    type="file"
                    name="image_file"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-3 py-2 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 text-[#000000] cursor-pointer transition flex items-center gap-1 justify-center font-semibold text-xs h-20 flex-col">
                    <Upload className="w-4 h-4" />
                    <span className="text-center">{formData.image_file_name ? formData.image_file_name.substring(0, 12) : 'بارکردن'}</span>
                  </div>
                </div>
              </div>
            </div>

            {formData.image_url && (
              <div className="mt-2">
                <IKImage
                  src={getAdminImageUrl(formData.image_url)}
                  alt="Preview"
                  width={400}
                  height={150}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-2 py-1">
              <label className="block text-xs font-semibold text-gray-700">
                نەماوە
              </label>
              <button
                type="button"
                onClick={toggleSoldOut}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#000000] focus:ring-offset-1 ${
                  formData.is_sold_out ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.is_sold_out ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {message && (
              <div className={`p-2 rounded-lg text-xs font-semibold ${messageType === 'success' ? 'bg-gray-100 text-black' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                  setMessage('');
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white text-xs py-2"
              >
                لابردن
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#000000] hover:bg-[#1a1a1a] text-white text-xs py-2"
              >
                {submitting ? 'زیادکردن...' : 'زیادکردن'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="lg:max-w-5xl max-h-[80vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">گۆڕینی کاڵا</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div>
              <label htmlFor="edit-name_en" className="block text-sm font-semibold text-gray-700 mb-2">
                ناوی خواردنەی (English)
              </label>
              <input
                id="edit-name_en"
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="edit-name_ckb" className="block text-sm font-semibold text-gray-700 mb-2">
                ناوی خواردنەی (Kurdish)
              </label>
              <input
                id="edit-name_ckb"
                type="text"
                name="name_ckb"
                value={formData.name_ckb}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="edit-name_arb" className="block text-sm font-semibold text-gray-700 mb-2">
                ناوی خواردنەی (Arabic)
              </label>
              <input
                id="edit-name_arb"
                type="text"
                name="name_arb"
                value={formData.name_arb}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="edit-description_en" className="block text-sm font-semibold text-gray-700 mb-2">
                وەسف (English)
              </label>
              <textarea
                id="edit-description_en"
                name="description_en"
                value={formData.description_en}
                onChange={handleInputChange}
                placeholder="Food description in English"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="edit-description_ckb" className="block text-sm font-semibold text-gray-700 mb-2">
                وەسف (Kurdish)
              </label>
              <textarea
                id="edit-description_ckb"
                name="description_ckb"
                value={formData.description_ckb}
                onChange={handleInputChange}
                placeholder="وەسفی خواردنەی"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="edit-description_arb" className="block text-sm font-semibold text-gray-700 mb-2">
                وەسف (Arabic)
              </label>
              <textarea
                id="edit-description_arb"
                name="description_arb"
                value={formData.description_arb}
                onChange={handleInputChange}
                placeholder="وصف الطعام"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                سایز
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm text-gray-700">{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="newSize"
                  value={formData.newSize}
                  onChange={handleInputChange}
                  placeholder="زیادکردنی سایز..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
                />
                <Button
                  type="button"
                  onClick={addSize}
                  className="bg-[#000000] hover:bg-[#1a1a1a] text-white"
                >
                  زیادکردن
                </Button>
              </div>
            </div>

            <ColorPicker 
              colors={formData.colors} 
              onChange={(newColors) => setFormData((prev) => ({ ...prev, colors: newColors }))}
              maxColors={6}
            />

            <div>
              <label htmlFor="edit-category" className="block text-sm font-semibold text-gray-700 mb-2">
                بەشەکان
              </label>
              <select
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#000000] text-gray-900"
              >
                <option value="">هەڵبژاردنی بەشەکان</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label_ckb}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                نەماوە
              </label>
              <button
                type="button"
                onClick={toggleSoldOut}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#000000] focus:ring-offset-2 ${
                  formData.is_sold_out ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    formData.is_sold_out ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                وێنە بسووڕینەوە
              </label>
              <div className="relative">
                <input
                  id="edit-image"
                  type="file"
                  name="image_file"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer hover:border-[#000000] transition flex items-center gap-2 justify-center font-semibold">
                  <Upload className="w-4 h-4 text-gray-500" />
                  {formData.image_file_name ? formData.image_file_name : 'فایل هیلبژێرە'}
                </div>
              </div>
              {formData.image_url && (
                <div className="mt-3">
                  <IKImage
                    src={getAdminImageUrl(formData.image_url)}
                    alt="Preview"
                    width={400}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${messageType === 'success' ? 'bg-gray-100 text-black' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                  resetForm();
                  setMessage('');
                  setMessageType('success');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                هەڵوەشاندنەوە
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#000000] hover:bg-[#1a1a1a] text-white"
              >
                {submitting ? 'نوێکردن...' : 'نوێکردنەوە'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ڕەشکردنەوە</DialogTitle>
            <DialogDescription className="text-center">
             ئایە دڵنیایت لە ڕەشکردنەوەی ئەم؟ 
            </DialogDescription>
          </DialogHeader>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-semibold ${messageType === 'success' ? 'bg-gray-100 text-black' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteId(null);
                setMessage('');
                setMessageType('success');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              هەڵوەشاندن
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ڕەشکردنەوە
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ImageKitProvider>
  );
}

