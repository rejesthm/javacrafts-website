import "server-only";

const encoder = new TextEncoder();

export type EventStream = {
  response: Response;
  send: (event: string, data: unknown) => void;
  close: () => void;
  onClose: (cleanup: () => void) => void;
};

export function createEventStream(request: Request): EventStream {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;
  const cleanups = new Set<() => void>();

  function close() {
    if (closed) return;
    closed = true;
    for (const cleanup of cleanups) cleanup();
    cleanups.clear();
    try {
      controller?.close();
    } catch {
      // The browser may already have closed the stream.
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(nextController) {
      controller = nextController;
      nextController.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel: close,
  });

  request.signal.addEventListener("abort", close, { once: true });
  const keepalive = setInterval(() => {
    if (!closed) controller?.enqueue(encoder.encode(": keepalive\n\n"));
  }, 15_000);
  cleanups.add(() => clearInterval(keepalive));

  return {
    response: new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    }),
    send(event, data) {
      if (closed) return;
      controller?.enqueue(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
      );
    },
    close,
    onClose(cleanup) {
      if (closed) cleanup();
      else cleanups.add(cleanup);
    },
  };
}
