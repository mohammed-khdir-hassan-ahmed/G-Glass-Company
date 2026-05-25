'use client';

import { ImageKitProvider } from '@imagekit/react';
import { ReactNode } from 'react';

export default function ImageKitWrapper({ children }: { children: ReactNode }) {
  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
      {children}
    </ImageKitProvider>
  );
}
