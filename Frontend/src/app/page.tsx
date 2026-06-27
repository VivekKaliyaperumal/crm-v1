import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const store = await cookies();
  const authed = Boolean(store.get('sb-refresh-token')?.value);
  redirect(authed ? '/app/leads' : '/login');
}
