import type { Metadata, Viewport } from "next";
import { Titillium_Web } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

export const viewport: Viewport = {
    themeColor: "#0F0F17",
};

const titillium = Titillium_Web({
    subsets: ["latin"],
    weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
    title: { default: "PADDOCK", template: "%s — PADDOCK" },
    description: "Classements, fiches pilotes et week-ends de Grand Prix de F1",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <body
                className={`${titillium.className} flex min-h-screen flex-col bg-[#0F0F17] text-white antialiased`}
            >
                <Header />

                <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-16 pt-8 sm:px-6">
                    {children}
                </div>

                <footer className="border-t border-white/[0.08] px-6 py-[18px] text-center text-xs font-semibold text-white/35">
                    PADDOCK — Données jolpica-f1 · Photos Wikimedia Commons
                </footer>
            </body>
        </html>
    );
}