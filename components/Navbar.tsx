'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Info, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CompanyShowcase from '@/components/CompanyShowcase';
import { useLocale } from 'next-intl';

export default function Navbar() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-12 py-1 md:py-0.5 border-b-2 border-gray-100 top-0 z-40 bg-white gap-6 sticky">
        {/* Left side - Logo */}
        <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
          <Image
            src="/image/image.png"
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
          {/* About Button */}
          <Button
            className="cursor-pointer w-10 h-10 aspect-square md:w-10 md:h-10 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-md flex items-center justify-center flex-shrink-0"
            onClick={() => setIsCompanyOpen(true)}
            title={locale === 'ar' ? 'حول الشركة' : locale === 'ku' ? 'دەربارەی کۆمپانیا' : 'About Company'}
          >
            <Info className="w-6 h-6 md:w-5 md:h-5" />
          </Button>
          {/* Location Button */}
          <Button
            className="cursor-pointer w-10 h-10 aspect-square md:w-10 md:h-10 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-md flex items-center justify-center flex-shrink-0"
            onClick={() => setIsLocationOpen(true)}
          >
            <MapPin className="w-6 h-6 md:w-5 md:h-5" />
          </Button>
        </div>
      </nav>

      {/* Company Showcase Modal */}
      <CompanyShowcase isOpen={isCompanyOpen} onClose={() => setIsCompanyOpen(false)} />

      {/* Location Modal */}
      <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <DialogContent 
          className="w-[80vw]  max-w-sm md:max-w-md max-h-[85vh] overflow-y-auto p-3 md:p-4"
          dir={locale === 'en' ? 'ltr' : 'rtl'}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              {locale === 'en' ? 'Location Details' : locale === 'ar' ? 'تفاصيل الموقع' : 'تفصيلاتی ناونیشان'}
            </DialogTitle>
          </DialogHeader>

            {/* Logo & Name */}
            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="relative h-20 w-20 md:h-20 md:w-20">
                <Image
                  src="/image/image.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg md:text-xl text-[#000000] mt-1">
                {locale === 'en' ? ' Global Glass Company' : locale === 'ar' ? 'شركة زجاج العالمية ' : ' کۆمپانیای جیهانی شوشە'}
              </span>
            </div>

          {/* Content */}
          <div className="bg-white rounded-lg p-3 space-y-3">
            {/* Social Media Card */}
            <div className="bg-pink-50 rounded-lg px-2 py-2 border border-pink-200">
              
              <div className="flex items-center gap-2 mb-2">
                <p className='font-bold text-xs'>
                  {locale === 'en' ? 'Our Social Media:' : locale === 'ar' ? 'وسائط التواصل الاجتماعي:' : 'سۆشیاڵ میدیاکانمان:'}
                </p>
               
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1HwugSQwyQ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-md p-1.5 flex flex-col items-center gap-0.5 transition-all hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
            <span className="text-xs font-bold text-white">Facebook</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@hamasha.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-black hover:bg-gray-800 rounded-md p-1.5 flex flex-col items-center gap-0.5 transition-all hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                  </svg>
                  <span className="text-xs font-bold text-white">TikTok</span>
                </a>

                {/* Viber */}
                <a
                  href="viber://chat?number=9647719776307"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-md p-1.5 flex flex-col items-center gap-0.5 transition-all hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.222 1.99-1.8 5.681-2.053 7.511-1.941l-.4-.029zm.358 2.021a.362.362 0 0 0-.34.363c0 .2.161.363.361.363 2.932.01 5.3 2.379 5.311 5.311 0 .2.162.362.361.362s.36-.162.36-.362c-.01-3.333-2.7-6.027-6.032-6.037h-.021zm-3.041.94a.956.956 0 0 0-.6.231c-.32.26-.63.56-.91.9-.28.35-.17.47-.05.7.45.88 1.51 2.699 2.8 4.13s3.25 2.35 4.131 2.8c.23.12.35.23.71-.05.33-.28.63-.59.89-.91.26-.32.32-.44.23-.7-.21-.53-1.201-1.59-1.721-2.05-.46-.4-.84-.14-1.091.03-.25.16-.37.24-.52.24s-.27-.06-.44-.17c-.51-.31-1.141-.8-1.64-1.32-.51-.51-.99-1.14-1.311-1.65-.09-.17-.14-.29-.14-.44s.08-.27.24-.52c.17-.25.43-.631.03-1.091-.46-.52-1.52-1.511-2.05-1.721a.597.597 0 0 0-.21-.039l-.01-.002zm3.121 1.47a.36.36 0 0 0-.34.362c0 .2.162.362.361.362 2.133 0 3.871 1.738 3.871 3.871 0 .2.161.361.361.361s.36-.161.36-.361c0-2.535-2.058-4.595-4.592-4.595h-.021zm0 1.674a.36.36 0 0 0-.34.362c0 .2.161.362.36.362 1.345 0 2.44 1.096 2.44 2.441 0 .2.162.361.362.361s.361-.161.361-.361c0-1.744-1.42-3.164-3.162-3.164l-.021-.001z" />
                  </svg>
                  <span className="text-xs font-bold text-white">Viber</span>
                </a>
              </div>
            </div>

            {/* Phone Numbers Card */}
            <div className="bg-blue-50 rounded-lg px-2 py-2 border-2 border-blue-200">
              
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 rounded-full p-1.5">
                  <Phone size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  {locale === 'en' ? 'Phone Number' : locale === 'ar' ? 'رقم الهاتف' : 'ژمارە تەلەفۆن'}
                </p>
              </div>
              <button
                onClick={() => window.location.href = 'tel:+964123456789'}
                className="text-sm font-bold text-blue-900 hover:text-blue-600 transition break-all text-left hover:underline"
                dir={locale === 'en' ? 'ltr' : 'rtl'}
              >
               07719776307
              </button>
              
            </div>

            {/* Opening Hours Card */}
            <div className="bg-amber-50 rounded-lg px-2 py-2 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-500 rounded-full p-1.5">
                  <Clock size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  {locale === 'en' ? 'Open Hours' : locale === 'ar' ? 'ساعات العمل' : 'کراوەیە لە ڕۆژانە'}
                </p>
              </div>
              <p className="text-sm font-bold text-amber-900" dir={locale === 'en' ? 'ltr' : 'rtl'}>
                {locale === 'en' ? '09:00 AM - 06:00 PM' : locale === 'ar' ? '09:00 صباحاً - 06:00 مساءً' : '06:00 بەیانی  - 09:00 شەو'}
              </p>
              
            </div>

            {/* Location Card */}
            <div className="bg-purple-50 rounded-lg px-2 py-2 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-500 rounded-full p-1.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  {locale === 'en' ? 'Location' : locale === 'ar' ? 'الموقع' : 'ناونیشان'}
                </p>
              </div>
              <p className="text-[10px] text-purple-900 font-semibold leading-snug" dir={locale === 'en' ? 'ltr' : 'rtl'}>
                {locale === 'en' ? 'Sulaymaniyah - Mawlawi Street' : locale === 'ar' ? 'السليمانية - شارع الملاوي' : 'سلێمانی - جادەی مەولەوی'}
              </p>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setIsLocationOpen(false)}
              className="w-full mt-3 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-lg py-2 md:py-3 font-semibold text-sm"
            >
              {locale === 'en' ? 'Close' : locale === 'ar' ? 'إغلاق' : 'داخستن'}
            </Button>

           
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

