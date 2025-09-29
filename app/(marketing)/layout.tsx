export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="marketing">
        {children}
      </body>
    </html>
  );
}
