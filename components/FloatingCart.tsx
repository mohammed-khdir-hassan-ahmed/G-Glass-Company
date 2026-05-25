'use client';

import React, { useState } from 'react';
import { useCart, CartItem } from '@/components/CartContext';
import { ShoppingBag, X, Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { imageKitLoader, getResponsiveSizes } from '@/lib/imagekit-loader';

export default function FloatingCart() {
  const locale = useLocale();
  const { cartItems, removeFromCart, updateQuantity, totalItems, isMounted } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isMounted || totalItems === 0) return null;

  const isRTL = locale === 'ku' || locale === 'ar';

  const t = {
    cartTitle: locale === 'en' ? 'Shopping Cart' : locale === 'ar' ? 'سلة التسوق' : 'سەبەتەی کڕین',
    checkout: locale === 'en' ? 'Checkout Details' : locale === 'ar' ? 'تفاصيل الطلب' : 'تەواوکردنی داواکاری',
    namePlaceholder: locale === 'en' ? 'Your Name' : locale === 'ar' ? 'الاسم الكامل' : 'ناوی تەواوت بنووسە',
    phonePlaceholder: locale === 'en' ? 'Phone Number' : locale === 'ar' ? 'رقم الهاتف' : 'ژمارەی تەلەفۆن',
    addressPlaceholder: locale === 'en' ? 'Delivery Address' : locale === 'ar' ? 'العنوان' : 'ناونیشانی گەیاندن',
    sendOrder: locale === 'en' ? 'Send Order via WhatsApp' : locale === 'ar' ? 'إرسال الطلب عبر الواتساب' : 'ناردنی داواکاری بە whatsapp',
    total: locale === 'en' ? 'Total' : locale === 'ar' ? 'المجموع' : 'کۆی گشتی',
    size: locale === 'en' ? 'Size' : locale === 'ar' ? 'الحجم' : 'سایز',
    color: locale === 'en' ? 'Color' : locale === 'ar' ? 'اللون' : 'ڕەنگ',
    emptyCart: locale === 'en' ? 'Your cart is empty' : locale === 'ar' ? 'سلتك فارغة' : 'سەبەتەکەت بەتاڵە',
    requiredFields: locale === 'en' ? 'Please fill in all fields' : locale === 'ar' ? 'يرجى ملء جميع الحقول' : 'تکایە هەموو خانەکان پڕ بکەرەوە',
  };

  const getDisplayName = (item: CartItem['menuItem']) => {
    if (locale === 'ar') {
      return (item as any).name_arb || item.name_en || item.name_ckb || 'Menu Item';
    } else if (locale === 'ku') {
      return item.name_ckb || item.name_en || 'Menu Item';
    } else {
      return item.name_en || item.name_ckb || 'Menu Item';
    }
  };

  // Parse price digits, e.g. "15000 دینار" -> 15000
  const parsePrice = (priceStr: string) => {
    const cleaned = priceStr.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parsePrice(item.menuItem.price);
      return acc + price * item.quantity;
    }, 0);
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return locale === 'en' ? 'Dynamic Price' : 'نرخی دیارینەکراوە';
    return amount.toLocaleString() + (locale === 'en' ? ' IQD' : ' دینار');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setValidationError(t.requiredFields);
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    const subtotal = calculateSubtotal();

    // Format WhatsApp message
    let message = '';
    if (locale === 'en') {
      message += `*Hello Global Glass Company, I want to place a new order:*\n\n`;
      message += `*Customer Details:*\n`;
      message += `• Name: ${name}\n`;
      message += `• Phone: ${phone}\n`;
      message += `• Address: ${address}\n\n`;
      message += `*Items Details:*\n`;
      cartItems.forEach((item, index) => {
        const title = getDisplayName(item.menuItem);
        const options = [];
        if (item.selectedSize) options.push(`Size: ${item.selectedSize}`);
        if (item.selectedColor) options.push(`Color: ${item.selectedColor}`);
        const optionsStr = options.length > 0 ? ` (${options.join(', ')})` : '';
        message += `${index + 1}. ${title}${optionsStr} - *Qty: ${item.quantity}* x ${item.menuItem.price}\n`;
      });
      message += `\n*Total:* ${formatPrice(subtotal)}`;
    } else if (locale === 'ar') {
      message += `*مرحباً شركة زجاج العالمية، أود تقديم طلب جديد:*\n\n`;
      message += `*تفاصيل الزبون:*\n`;
      message += `• الاسم: ${name}\n`;
      message += `• الهاتف: ${phone}\n`;
      message += `• العنوان: ${address}\n\n`;
      message += `*تفاصيل العناصر:*\n`;
      cartItems.forEach((item, index) => {
        const title = getDisplayName(item.menuItem);
        const options = [];
        if (item.selectedSize) options.push(`الحجم: ${item.selectedSize}`);
        if (item.selectedColor) options.push(`اللون: ${item.selectedColor}`);
        const optionsStr = options.length > 0 ? ` (${options.join(', ')})` : '';
        message += `${index + 1}. ${title}${optionsStr} - *الكمية: ${item.quantity}* x ${item.menuItem.price}\n`;
      });
      message += `\n*المجموع:* ${formatPrice(subtotal)}`;
    } else {
      message += `*سڵاو کۆمپانیای جیهانی شوشە، دەمەوێت داواکارییەکی نوێ بکەم:*\n\n`;
      message += `*زانیاری کڕیار:*\n`;
      message += `• ناو: ${name}\n`;
      message += `• تەلەفۆن: ${phone}\n`;
      message += `• ناونیشان: ${address}\n\n`;
      message += `*زانیاری کاڵاکان:*\n`;
      cartItems.forEach((item, index) => {
        const title = getDisplayName(item.menuItem);
        const options = [];
        if (item.selectedSize) options.push(`سایز: ${item.selectedSize}`);
        if (item.selectedColor) options.push(`ڕەنگ: ${item.selectedColor}`);
        const optionsStr = options.length > 0 ? ` (${options.join(', ')})` : '';
        message += `${index + 1}. ${title}${optionsStr} - *ژمارە: ${item.quantity}* x ${item.menuItem.price}\n`;
      });
      message += `\n*کۆیی گشتی:* ${formatPrice(subtotal)}`;
    }

    const whatsappNumber = '9647504362141';
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating Cart Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 50 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed right-4 md:right-8 bottom-4 md:bottom-6 w-12 h-12 md:w-14 md:h-14 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 z-40"
        title={t.cartTitle}
        aria-label="Open cart"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
          <motion.span
            key={totalItems}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2.5 -right-2.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-black rounded-full bg-red-600 text-white shadow-md border border-white"
          >
            {totalItems}
          </motion.span>
        </div>
      </motion.button>

      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col ${
                isRTL ? 'left-0 border-r border-gray-100' : 'right-0 border-l border-gray-100'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-800" />
                  <span className="font-extrabold text-lg text-gray-900">{t.cartTitle}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                    {totalItems}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {cartItems.map((item) => {
                  const title = getDisplayName(item.menuItem);
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl border border-gray-150 bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white">
                        <Image
                          loader={imageKitLoader}
                          src={item.menuItem.image_url}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col min-w-0 justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">{title}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-bold text-gray-600">
                            {item.selectedSize && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-200/80">
                                {t.size}: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-200/80 flex items-center gap-1">
                                {t.color}:
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Price row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900">
                            {item.menuItem.price}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex flex-col justify-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Checkout Form & Footer */}
              <div className="border-t border-gray-150 p-4 bg-gray-50 flex-shrink-0">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="font-extrabold text-sm text-gray-700">{t.total}:</span>
                  <span className="font-black text-lg text-gray-900">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckout} className="space-y-2.5 mb-2">
                  <h4 className="text-xs font-extrabold text-gray-800 tracking-wider uppercase mb-1 px-0.5">
                    {t.checkout}
                  </h4>
                  {validationError && (
                    <p className="text-red-500 text-xs font-bold px-0.5">{validationError}</p>
                  )}
                  <Input
                    type="text"
                    required
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-gray-200 text-[16px] md:text-sm placeholder:text-xs font-medium rounded-lg h-9"
                  />
                  <Input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full bg-white border-gray-200 text-[16px] md:text-sm placeholder:text-xs font-medium rounded-lg h-9 ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Input
                    type="text"
                    required
                    placeholder={t.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border-gray-200 text-[16px] md:text-sm placeholder:text-xs font-medium rounded-lg h-9"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2.5 bg-[#000000] hover:bg-[#1a1a1a] text-white font-extrabold text-xs sm:text-sm rounded-lg h-11 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-black"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>{t.sendOrder}</span>
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
