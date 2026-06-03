'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from 'next-intl';

export default function Navbar() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-12 py-1 md:py-0.5 border-b-2 border-gray-100 top-0 z-40 bg-white gap-6 sticky">
        {/* Left side - Logo */}
        <div className="w-[50px] h-[50px] md:w-16 md:h-16 flex-shrink-0">
          <Image
            src="/image/logo.jpeg"
            alt="Logo"
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Buttons */}
        <div className="flex gap-2 items-center">
          {/* Language Switcher */}
          <LanguageSwitcher />
          {/* Location Button */}
          <Button
            className="cursor-pointer w-10 h-10 aspect-square md:w-10 md:h-10 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-md flex items-center justify-center flex-shrink-0"
            onClick={() => setIsLocationOpen(true)}
          >
            <MapPin className="w-6 h-6 md:w-5 md:h-5" />
          </Button>
        </div>
      </nav>

      {/* Location Modal */}
      <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <DialogContent
          className="w-[90vw] max-w-sm md:max-w-xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-2 md:p-3 lg:p-4 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-200"
          dir={locale === 'en' ? 'ltr' : 'rtl'}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              {locale === 'en' ? 'Location Details' : locale === 'ar' ? 'تفاصيل الموقع' : 'تفصيلاتی ناونیشان'}
            </DialogTitle>
          </DialogHeader>

          {/* Logo & Name */}
          <div className="flex flex-col items-center gap-2 mb-3.5 lg:mb-4 pb-2 border-b-2 border-gray-100">
            <div className="relative h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 flex items-center justify-center">
              <Image
                src="/image/logo.jpeg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-base md:text-lg lg:text-xl text-gray-800 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {locale === 'en' ? ' Global Glass Company' : locale === 'ar' ? 'شركة زجاج العالمية ' : ' کۆمپانیای جیهانی شوشە'}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-2 md:space-y-2.5 lg:space-y-3 grid md:grid-cols-2 gap-2 md:gap-2.5 lg:gap-3">
            {/* Social Media Card */}
            <div className="bg-gradient-to-br from-pink-50 via-pink-50 to-rose-50 rounded-xl px-2 md:px-3 py-2 md:py-2.5 border-1.5 border-pink-300 shadow-sm hover:shadow-md transition-all md:col-span-2">

              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-0.5 h-3 bg-gradient-to-b from-pink-400 to-rose-400 rounded-full"></div>
                <p className='font-bold text-[10px] md:text-xs text-pink-900'>
                  {locale === 'en' ? 'Our Social Media:' : locale === 'ar' ? 'وسائط التواصل الاجتماعي:' : 'سۆشیاڵ میدیاکانمان:'}
                </p>

              </div>

              {/* Social Links */}
              <div className="flex gap-1.5 md:gap-2">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1BDWuYxCix/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg p-1.5 md:p-2 flex flex-col items-center gap-0.5 transition-all hover:scale-110 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-[8px] md:text-[9px] font-bold text-white drop-shadow">Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/9647504362141"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg p-1.5 md:p-2 flex flex-col items-center gap-0.5 transition-all hover:scale-110 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l6.06-1.92C9.5 21.56 10.7 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.2 0-2.35-.3-3.35-.84l-.24-.14-2.48.79.81-2.43-.15-.24C4.34 14.35 4 13.2 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.14-7.28c-.23-.12-1.37-.67-1.58-.75-.22-.08-.37-.12-.52.12-.15.23-.58.75-.71.9-.13.15-.27.17-.5.04-.23-.12-1.02-.38-1.93-1.2-.72-.65-1.2-1.44-1.34-1.67-.13-.23-.01-.35.1-.46.1-.1.23-.27.34-.41.1-.14.14-.23.2-.38.08-.15.04-.27-.02-.38-.06-.12-.52-1.28-.72-1.74-.18-.46-.38-.39-.52-.4h-.45c-.15 0-.4.06-.61.29-.22.23-.84.83-.84 2.02 0 1.19.87 2.34 1 2.5.12.15 1.74 2.66 4.22 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.49-.61 1.7-1.2.2-.59.2-1.1.15-1.2-.06-.1-.22-.16-.46-.28z" />
                  </svg>
                  <span className="text-[8px] md:text-[9px] font-bold text-white drop-shadow">WhatsApp</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@shalawglass?_r=1&_t=ZS-96YLvXmntH2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-br from-black to-gray-800 hover:from-gray-800 hover:to-black rounded-lg p-1.5 md:p-2 flex flex-col items-center gap-0.5 transition-all hover:scale-110 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                  <span className="text-[8px] md:text-[9px] font-bold text-white drop-shadow">TikTok</span>
                </a>
              </div>
            </div>

            {/* Phone Numbers Card */}
            <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-xl px-2 md:px-3 py-2 md:py-2.5 border-1.5 border-blue-300 shadow-sm hover:shadow-md transition-all">

              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-1.5 shadow-sm">
                  <Phone size={12} className="text-white" />
                </div>
                <p className="text-[8px] md:text-[9px] font-bold text-blue-900 uppercase tracking-tight">
                  {locale === 'en' ? 'Phone Number' : locale === 'ar' ? 'رقم الهاتف' : 'ژمارە تەلەفۆن'}
                </p>
              </div>
              <button
                onClick={() => window.location.href = 'tel:+964123456789'}
                className="text-[10px] md:text-xs font-bold text-blue-700 hover:text-blue-600 transition break-all text-left hover:underline font-medium"
                dir={locale === 'en' ? 'ltr' : 'rtl'}
              >
                07504362141 - 07701409997

              </button>

            </div>

            {/* Opening Hours Card */}
            <div className="bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 rounded-xl px-2 md:px-3 py-2 md:py-2.5 border-1.5 border-amber-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-1.5 shadow-sm">
                  <Clock size={12} className="text-white" />
                </div>
                <p className="text-[8px] md:text-[9px] font-bold text-amber-900 uppercase tracking-tight">
                  {locale === 'en' ? 'Open Hours' : locale === 'ar' ? 'ساعات العمل' : 'کراوەیە لە ڕۆژانە'}
                </p>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-amber-800" dir={locale === 'en' ? 'ltr' : 'rtl'}>
                {locale === 'en' ? '08:00 AM - 05:00 PM' : locale === 'ar' ? '08:00 صباحاً - 05:00 مغریب' : '08:00 بەیانی  - 05:00 ئێوارە'}
              </p>

            </div>

            {/* Location Card */}
            <a
              href="https://www.google.com/maps?q=36.144667,43.997528"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 via-purple-50 to-indigo-50 rounded-xl px-2 md:px-3 py-2 md:py-2.5 border-1.5 border-purple-300 shadow-sm hover:shadow-md transition-all block cursor-pointer hover:scale-[1.02] duration-200"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full p-1.5 shadow-sm">
                    <MapPin size={12} className="text-white" />
                  </div>
                  <p className="text-[8px] md:text-[9px] font-bold text-purple-900 uppercase tracking-tight">
                    {locale === 'en' ? 'Location' : locale === 'ar' ? 'الموقع' : 'ناونیشان'}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-black">
                  <span>Google Maps</span>
                  <ExternalLink size={8} />
                </div>
              </div>
              <p className="text-[8px] md:text-[9px] lg:text-[10px] text-purple-800 font-semibold leading-tight" dir={locale === 'en' ? 'ltr' : 'rtl'}>
                {locale === 'en' ? 'Iraq - erbil - north industrial' : locale === 'ar' ? 'عراق  - اربیل - الصناعە الشمالیە' : 'عێراق - ‌هەولێر - پیشەسازی باشوور'}
              </p>
            </a>

            {/* Close Button */}
            <Button
              onClick={() => setIsLocationOpen(false)}
              className="w-full md:col-span-2 mt-2.5 md:mt-3.5 bg-gradient-to-r from-gray-900 via-gray-800 to-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-900 text-white rounded-lg py-1.5 md:py-2 lg:py-2.5 font-semibold text-[10px] md:text-xs shadow-lg hover:shadow-xl transition-all"
            >
              {locale === 'en' ? 'Close' : locale === 'ar' ? 'إغلاق' : 'داخستن'}
            </Button>


          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

