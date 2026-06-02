'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { getAdminImageUrl } from '@/lib/imagekit';
import { imageKitLoader } from '@/lib/imagekit-loader';

interface CarouselItem {
  id: number;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

export default function CarouselManagement() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/carousel');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching carousel items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setMessage(' تکایە چاوەرێبە . . .');
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Store the uploaded image URL
      setUploadedImageUrl(uploadData.filePath);
      setImageFile(file);
      setMessage('وێنە بەسەرکەوتوویی زیادکرا ✅');
      setMessageType('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`هەڵە: ${errorMessage}`);
      setMessageType('error');
      setImageFile(null);
      setImagePreview('');
      setUploadedImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (!uploadedImageUrl) {
        setMessage('براکو وێنەیەک هەڵبژێرە');
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      // Check if already have 3 items
      if (items.length >= 3) {
        setMessage('تەنها سێ وێنە دەتوانیت زیاد بکەیت!');
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      // Create carousel item with already-uploaded image URL
      const response = await fetch('/api/carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: uploadedImageUrl,
          order_index: items.length,
        }),
      });

      if (response.ok) {
        setMessage('وێنە زیادکرا!');
        setMessageType('success');
        setImageFile(null);
        setImagePreview('');
        setUploadedImageUrl('');
        setShowAddModal(false);
        fetchItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create carousel item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`هەڵە: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/carousel/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('وێنە سڕێنەرێت!');
        setMessageType('success');
        fetchItems();
      } else {
        setMessage('هەڵە لە سڕینەوەدا');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('هەڵە لە سڕینەوەدا');
      setMessageType('error');
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadedImageUrl('');
    setMessage('');
  };

  if (loading) {
    return <div className="text-center py-8">چاوەرێبە...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Add New Image */}
      {items.length < 3 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">زیادکردنی وێنەی کارۆسێل</h3>
            <Button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-[#000000] hover:bg-zinc-800 text-white rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              زیادکردن
            </Button>
          </div>

        </div>
      )}

      {/* Section 2: Images List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">لیستی وێنەکان ({items.length}/3)</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">هیچ وێنێک بەردەست نییە</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="relative h-40 bg-gray-100">
                  <Image
                    loader={imageKitLoader}
                    src={item.image_url}
                    alt="carousel"
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex gap-2">
                  <Button
                    onClick={() => handleDeleteClick(item.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className='flex justify-center'>زیادکردنی وێنە</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="preview"
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* File Input */}
            <div>
        
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">وێنەیەک هەڵبژێرە</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting || !imageFile}
                className="w-full bg-[#000000] hover:bg-zinc-800 text-white"
              >
                {submitting ? 'بارکردن...' : 'زیادکردن'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle className='flex justify-center'>سڕینەوە</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 flex justify-center">ئایا دڵنیایت کە دەتەوێت ئەم وێنەیە بسڕیتەوە؟</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="text-gray-700"
            >
              نەخێر
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              بەڵێ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
