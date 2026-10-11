import { api } from '@/convex/_generated/api';
import { authenticatedConvex } from '@/lib/convex-server';
import { apiError } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };
export async function GET(_req: Request, { params }: Params) {
  try { return Response.json(await (await authenticatedConvex()).query(api.tasks.get, { id: (await params).id })); }
  catch (error) { return apiError(error); }
}
export async function PATCH(req: Request, { params }: Params) {
  try {
    const client = await authenticatedConvex();
    const { title, description, priority, dueDate, lessonId, lessonTitle } = await req.json();
    return Response.json(await client.mutation(api.tasks.update, { id: (await params).id, title, description, priority, dueDate, lessonId, lessonTitle }));
  } catch (error) { return apiError(error); }
}
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await (await authenticatedConvex()).mutation(api.tasks.remove, { id: (await params).id });
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
