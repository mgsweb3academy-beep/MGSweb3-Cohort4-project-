import { redirect } from 'next/navigation';

// Root redirects to the admin panel for now.
// In the full product, routing is gated by role from useSession().
export default function Home() {
  redirect('/admin');
}
