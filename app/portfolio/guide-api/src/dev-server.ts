import { createServer } from 'node:http'
import { handleRequest } from './handler.js'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)

createServer((request, response) => {
  const chunks: Buffer[] = []

  request.on('data', (chunk: Buffer) => chunks.push(chunk))
  request.on('end', () => {
    void (async () => {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
      const headers: Record<string, string | undefined> = {}
      for (const [key, value] of Object.entries(request.headers)) {
        headers[key] = Array.isArray(value) ? value.join(',') : value
      }

      const handled = await handleRequest({
        method: request.method ?? 'GET',
        path: url.pathname,
        headers,
        body: chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : null,
      })

      response.writeHead(handled.statusCode, handled.headers)
      response.end(handled.body)
    })().catch(() => {
      response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
      response.end(JSON.stringify({ status: 'error', answer: 'Unexpected local server error.', citations: [] }))
    })
  })
}).listen(port, '0.0.0.0', () => {
  console.info(`hiraya-guide-api local server listening on http://localhost:${port}`)
})
