/**
 * Thin helper around an Express response object for writing
 * Server-Sent Events. Keeps the SSE wire format in one place.
 */
export function createSseChannel(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  // Keep the connection alive through proxies that kill idle sockets.
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 20000);

  function send(event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  function close() {
    clearInterval(heartbeat);
    res.end();
  }

  return { send, close };
}
