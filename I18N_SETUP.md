# Multi-Language Support (i18n) Implementation

## ✅ What's Been Added

### 1. **i18n Configuration**
- **Framework**: `next-intl` (v4.9.1) - the best practice for Next.js 16
- **Supported Languages**: 
  - **Kurdish (ckb)** - Default language
  - **English (en)**
- **Config Location**: `/i18n/request.ts`
- **Translation Files**: `/messages/` directory
  - `ckb.json` - Kurdish translations
  - `en.json` - English translations

### 2. **Language Switcher Button**
- **Location**: Next to the Location button in the Navbar
- **Icon**: Global/Languages icon (blue button)
- **Features**:
  - Click to open language selection modal
  - Select between English and Kurdish
  - Automatically redirects to the selected language
  - Preserves the current page (e.g., if you're on admin page, it stays on admin in the new language)

### 3. **Middleware Configuration**
- Automatically detects user language from URL
- Routes all pages through locale prefix: `/{locale}/page`
  - `/ckb/` - Kurdish
  - `/en/` - English
- Integrates with existing authentication middleware

### 4. **App Structure**
New localized structure:
```
app/
├── [locale]/                 # Dynamic locale folder
│   ├── layout.tsx           # Locale-specific layout (handles i18n provider)
│   ├── page.tsx             # Home page
│   ├── loading.tsx          # Loading component
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx     # Login page (localized)
│   └── admin/
│       ├── layout.tsx
│       └── dashboard/
│           └── page.tsx     # Dashboard (localized)
├── layout.tsx               # Root layout (minimal)
└── globals.css              # Global styles
```

### 5. **Translation Keys Available**
```json
{
  "common": {
    "location": "موقعیەت / Location",
    "language": "زمان / Language",
    "english": "English",
    "kurdish": "کوردی"
  },
  "menu": {
    "title": "Title",
    "noItems": "No items message",
    "error": "Error message"
  },
  "social": {
    "title": "Social media title",
    "facebook": "Facebook",
    "tiktok": "TikTok"
  }
}
```

## 🚀 How to Use

### 1. **Change Language**
- Click the blue **Language button** (globe icon) next to the location button
- Select your preferred language from the modal
- The page will reload in the selected language

### 2. **Add More Languages**
To add a new language (e.g., Arabic):

1. Create `/messages/ar.json` with translations
2. Update `/i18n/request.ts`:
   ```typescript
   export const locales = ['en', 'ckb', 'ar'] as const;
   ```
3. Update `/middleware.ts` to configure routing

### 3. **Use Translations in Components**
- **Server Components**:
  ```typescript
  import { getTranslations } from 'next-intl/server';
  
  const t = await getTranslations();
  <h1>{t('menu.title')}</h1>
  ```

- **Client Components**:
  ```typescript
  'use client';
  import { useTranslations } from 'next-intl';
  
  const t = useTranslations();
  <button>{t('common.location')}</button>
  ```

- **Get Current Locale**:
  ```typescript
  import { useLocale } from 'next-intl';
  const locale = useLocale(); // 'en' or 'ckb'
  ```

## 📁 Files Created/Modified

### Created Files:
- ✅ `/i18n/request.ts` - i18n configuration
- ✅ `/messages/ckb.json` - Kurdish translations
- ✅ `/messages/en.json` - English translations
- ✅ `/components/LanguageSwitcher.tsx` - Language switcher component
- ✅ `/app/[locale]/layout.tsx` - Localized root layout
- ✅ `/app/[locale]/page.tsx` - Localized home page
- ✅ `/app/[locale]/loading.tsx` - Localized loading component
- ✅ `/app/[locale]/(auth)/login/page.tsx` - Localized login
- ✅ `/app/[locale]/admin/dashboard/page.tsx` - Localized dashboard

### Modified Files:
- ✅ `/middleware.ts` - Integrated i18n middleware
- ✅ `/components/Navbar.tsx` - Added language switcher button
- ✅ `/next.config.ts` - Added next-intl plugin

### Removed Files (Old, conflicting):
- ✅ `/app/page.tsx` (replaced by `/app/[locale]/page.tsx`)
- ✅ `/app/loading.tsx` (replaced by `/app/[locale]/loading.tsx`)
- ✅ `/app/(auth)/` folder (replaced by `/app/[locale]/(auth)/`)
- ✅ `/app/admin/` folder (replaced by `/app/[locale]/admin/`)

## 🎯 Key Features

✅ **Automatic Language Detection** - Detects from URL and maintains across navigation
✅ **SEO Friendly** - Each language has its own URL structure
✅ **Type-Safe** - Full TypeScript support for translation keys
✅ **Performance** - No client-side language detection, built-in caching
✅ **User-Friendly** - Simple language switcher UI modal
✅ **RTL/LTR Support** - Auto-switches text direction based on language
✅ **Preserved State** - Changing language keeps you on the same page

## 💡 Next Steps

1. **Expand Translations**: Add more keys to the JSON files as needed
2. **Style the Switcher**: Customize the language button appearance
3. **Add More Languages**: Follow the pattern to add Arabic, Turkish, etc.
4. **Update Content**: Use translation keys in all user-facing text

## 🔗 URLs

- **Kurdish (Default)**: `http://localhost:3000` or `http://localhost:3000/ckb`
- **English**: `http://localhost:3000/en`
- **Login**: `http://localhost:3000/ckb/login` or `http://localhost:3000/en/login`
- **Dashboard**: `http://localhost:3000/ckb/admin/dashboard` or `http://localhost:3000/en/admin/dashboard`
