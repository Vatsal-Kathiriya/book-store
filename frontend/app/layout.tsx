import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Book Store Management',
  description: 'A complete book store management system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable}`}>
      <body className={nunito.className}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
