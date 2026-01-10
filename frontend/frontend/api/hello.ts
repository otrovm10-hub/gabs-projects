export const config = {
  runtime: "edge"
};

export default function handler(req: Request) {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
