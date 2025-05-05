export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-vh-100">
      {children}
    </div>
  );
}
