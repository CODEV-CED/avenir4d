export default function Probe() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mk-card p-8">
        <h2 className="text-xl font-semibold">Logo Probe</h2>
        <p className="mt-2 text-sm text-[color:var(--mk-sub)]">
          Drop your PNG to <code>/public/brand/nextyou-logo.png</code> and refresh.
        </p>
        <div className="mt-4">
          <img
            src="/brand/nextyou-logo.png"
            alt="Probe logo"
            style={{ width: 256, height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
