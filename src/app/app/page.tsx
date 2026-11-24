import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';

/**
 * The application itself lives at /app so that / can be a marketing landing
 * page that explains what FA Studio is before a visitor commits to anything.
 *
 * All navigation inside the app is client-side (tab state in AppShell), so
 * moving the route does not affect internal links.
 */
export const metadata: Metadata = {
  title: 'Workspace',
  // The sandbox is a private, stateful tool — keep it out of search indexes
  // so the landing page is what strangers find.
  robots: { index: false, follow: true }
};

export default function AppPage() {
  return <AppShell />;
}
