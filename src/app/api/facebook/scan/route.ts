import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { processFacebookPosts } from '@/services/facebook/facebookScanner.service';
import { fetchAndParseJobUrl } from '@/services/facebook/facebookUrlFetcher.service';
import { formatErrorResponse } from '@/lib/errors';
import { RawFacebookPostInput } from '@/services/facebook/facebook.types';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    let postsToProcess: RawFacebookPostInput[] = [];

    const body = await req.json().catch(() => ({}));

    // 1. Process Real URLs if provided
    if (body && Array.isArray(body.urls) && body.urls.length > 0) {
      const validUrls: string[] = body.urls
        .map((u: unknown) => (typeof u === 'string' ? u.trim() : ''))
        .filter((u: string) => u.startsWith('http://') || u.startsWith('https://'));

      for (const url of validUrls) {
        const fetched = await fetchAndParseJobUrl(url);
        postsToProcess.push({
          content: fetched.rawContent,
          postUrl: fetched.url,
          author: fetched.company,
        });
      }
    }

    // 2. Process Raw Pasted Posts if provided
    if (body && Array.isArray(body.posts) && body.posts.length > 0) {
      for (const p of body.posts) {
        if (p && typeof p.content === 'string' && p.content.trim()) {
          postsToProcess.push({
            content: p.content.trim(),
            postUrl: typeof p.postUrl === 'string' && p.postUrl.trim() ? p.postUrl.trim() : null,
            author: typeof p.author === 'string' && p.author.trim() ? p.author.trim() : undefined,
          });
        }
      }
    }

    // 3. Single URL shortcut
    if (body && typeof body.url === 'string' && body.url.trim().startsWith('http')) {
      const fetched = await fetchAndParseJobUrl(body.url.trim());
      postsToProcess.push({
        content: fetched.rawContent,
        postUrl: fetched.url,
        author: fetched.company,
      });
    }

    // 4. Require real input - NO fake data injection
    if (postsToProcess.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No real job URLs or post text provided. Please provide one or more real Facebook job links or paste the scrolled post text.',
        },
        { status: 400 }
      );
    }

    const result = await processFacebookPosts(userId, postsToProcess);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.scanned} real post(s). Found ${result.relevantCount} relevant job(s) and prepared ${result.draftsCreated} email draft(s) for your review.`,
      data: result,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
