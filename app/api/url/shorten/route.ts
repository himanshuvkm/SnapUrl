import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { withAuth } from "@/middlewares/withAuth";
import { rateLimiter } from "@/middlewares/rateLimiter";

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  // Rate limit check
  const limited = await rateLimiter(req);
  if (limited) return limited;

  try {
    const { longUrl, customSlug } = await req.json();

    if (!longUrl) {
      return NextResponse.json(
        { error: "longUrl is required" },
        { status: 400 },
      );
    }

    // Basic URL validation
    try {
      new URL(longUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const slug = customSlug || nanoid(7);

    // If custom slug, check it's not taken
    if (customSlug) {
      const existing = await prisma.link.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { error: "Slug already taken" },
          { status: 409 },
        );
      }
    }

    const link = await prisma.link.create({
      data: { slug, longUrl, userId },
    });

    // Pre-warm the cache immediately after creation
    await redis.set(`url:${slug}`, longUrl, "EX", 60 * 60 * 24);

    return NextResponse.json(
      {
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`,
        slug,
        longUrl,
        createdAt: link.createdAt,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[SHORTEN]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
