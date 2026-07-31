/**
 * Corridor LMS — AI Response Streaming Engine
 * Formats AI response streams via ReadableStream / Server-Sent Events (SSE) to satisfy <5s SLA (§6 Performance).
 */

export interface AIStreamChunk {
  id: string;
  agentId: string;
  delta: string;
  finished: boolean;
}

/**
 * Transforms an async generator of text tokens into an HTTP ReadableStream response suitable for Next.js API Routes.
 */
export function createAIResponseStream(
  tokenGenerator: AsyncIterable<string>,
  agentId: string
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const streamId = `stream_${Date.now()}`;
      try {
        for await (const token of tokenGenerator) {
          const chunk: AIStreamChunk = {
            id: streamId,
            agentId,
            delta: token,
            finished: false,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }

        // Send completion signal
        const finalChunk: AIStreamChunk = {
          id: streamId,
          agentId,
          delta: '',
          finished: true,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering for instant streaming
    },
  });
}
