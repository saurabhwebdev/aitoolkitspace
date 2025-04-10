import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIToolKit.space - AI Tools Directory",
  description: "A curated, SEO-optimized directory of AI tools and platforms across categories like text generation, image creation, audio processing, video editing, and more.",
  metadataBase: new URL('https://aitoolkit.space'),
  openGraph: {
    title: 'AIToolKit.space - AI Tools Directory',
    description: 'Discover and explore the best AI tools for text generation, image creation, audio processing, video editing, and more.',
    url: 'https://aitoolkit.space',
    siteName: 'AIToolKit.space',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIToolKit.space - AI Tools Directory',
    description: 'Discover and explore the best AI tools for text generation, image creation, audio processing, video editing, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification', // You'll need to replace this with your actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AIToolKit.space",
            "url": "https://aitoolkit.space",
            "logo": "https://aitoolkit.space/logo.png",
            "description": "A curated, SEO-optimized directory of AI tools and platforms across categories like text generation, image creation, audio processing, video editing, and more.",
            "sameAs": [
              "https://twitter.com/aitoolkit_space",
              "https://linkedin.com/company/aitoolkit-space",
              "https://facebook.com/aitoolkitspace"
            ]
          })
        }} />
        
        {/* Google Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=G-SLHW481K5J`} />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SLHW481K5J');
          `
        }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <AnalyticsProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow pt-16">
                {children}
              </main>
              <Footer />
            </div>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
