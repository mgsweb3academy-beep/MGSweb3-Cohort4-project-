import { acceptInvite } from '@/lib/auth-store';
import { apiError } from '@/lib/api-error';
export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  try { return Response.json(await acceptInvite((await params).code)); }
  catch (error) { return apiError(error); }
}
