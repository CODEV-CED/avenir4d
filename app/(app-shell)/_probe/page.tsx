// app/_probe/page.tsx
export default function Probe() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mk-card p-8">
        <h2 className="text-xl font-semibold">App Shell Probe</h2>
        <p className="mt-2 text-sm text-[color:var(--mk-sub)]">
          This page is rendered inside the app shell layout.
        </p>
      </div>
    </div>
  );
}
