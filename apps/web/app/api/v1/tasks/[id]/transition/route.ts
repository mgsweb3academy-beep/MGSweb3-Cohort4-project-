import { api } from '@/convex/_generated/api';
import { authenticatedConvex } from '@/lib/convex-server';
import { apiError } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };
export async function POST(req: Request, { params }: Params) {
  try {
    const client = await authenticatedConvex();
    const { to } = await req.json();
    return Response.json(await client.mutation(api.tasks.transition, { id: (await params).id, to }));
  } catch (error) { return apiError(error); }
}
