import { api } from '@/convex/_generated/api';
import { authenticatedConvex } from '@/lib/convex-server';
import { apiError } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };
export async function POST(req: Request, { params }: Params) {
  try {
    const client = await authenticatedConvex();
    const { status, comment } = await req.json();
    return Response.json(await client.mutation(api.tasks.review, { id: (await params).id, status, comment }), { status: 201 });
  } catch (error) { return apiError(error); }
}
