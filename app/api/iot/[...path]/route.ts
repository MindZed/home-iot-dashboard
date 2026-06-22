import { NextRequest, NextResponse } from "next/server";

async function handleProxy(request: NextRequest, params: { path: string[] }) {
  const espUrl = process.env.NEXT_PUBLIC_ESP32_URL;
  if (!espUrl) {
    return NextResponse.json({ error: "ESP32 URL not configured" }, { status: 500 });
  }

  // Construct the target URL.
  // The `path` array contains everything after `/api/iot/`.
  // Example: `/api/iot/data` -> `path` is `['data']` -> target is `${espUrl}/api/data`
  const pathString = params.path.join("/");
  
  // Pass along query parameters (like ?id=1)
  const searchParams = request.nextUrl.search;
  
  const targetUrl = `${espUrl}/api/${pathString}${searchParams}`;

  const clientId = process.env.NEXT_PUBLIC_CF_CLIENT_ID || "";
  const clientSecret = process.env.NEXT_PUBLIC_CF_CLIENT_SECRET || "";

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "CF-Access-Client-Id": clientId,
        "CF-Access-Client-Secret": clientSecret,
        "Content-Type": "application/json",
      },
      ...(request.method === "POST" && { body: await request.text() }),
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("IoT Proxy Error:", error);
    return NextResponse.json({ error: "Failed to connect to hardware" }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}
