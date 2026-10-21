import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ClearCut - In-Browser AI Background Remover',
  description:
    'Instantly remove image backgrounds entirely in your browser using client-side AI with drag-and-drop, side-by-side comparison, and live progress tracking.',
  openGraph: {
    title: 'ClearCut - In-Browser AI Background Remover',
    description:
      'Instantly remove image backgrounds entirely in your browser using client-side AI with drag-and-drop, side-by-side comparison, and live progress tracking.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClearCut - In-Browser AI Background Remover',
    description:
      'Instantly remove image backgrounds entirely in your browser using client-side AI with drag-and-drop, side-by-side comparison, and live progress tracking.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
