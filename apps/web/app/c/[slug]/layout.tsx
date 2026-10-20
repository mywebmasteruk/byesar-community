import type { ReactNode } from 'react';

// Shown on every community page while this runs as the public demo.
export default function CommunityLayout({ children }: { children: ReactNode }) {
  const demo = process.env.NEXT_PUBLIC_COMMUNITY_DEMO === '1';
  return (
    <>
      {demo && (
        <div role="status" className="bg-amber-100 p-2 text-center text-sm text-amber-900">
          Demo: data may be reset at any time. / نسخة تجريبية، وقد يُعاد ضبط البيانات.
        </div>
      )}
      {children}
    </>
  );
}
