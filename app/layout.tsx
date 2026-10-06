import type { Metadata } from "next";
import "./skr-theme.css";

export const metadata: Metadata = {
  title: "SKR • Acompanhamento de Obras & Blueprint",
  description: "Visualização técnica arquitetônica e acompanhamento de progresso em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="skr-grid-background">
        <div className="skr-ambient-wash" aria-hidden="true">
          <div className="skr-ambient-blob skr-ambient-blob-1" />
          <div className="skr-ambient-blob skr-ambient-blob-2" />
        </div>
        {children}
      </body>
    </html>
  );
}
