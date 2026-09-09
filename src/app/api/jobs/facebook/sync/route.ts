import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import {
  getDecryptedMetaToken,
  getMetaUserPages,
  fetchPageFeedPosts,
} from '@/services/meta.service';
import { ingestDiscoveredJobs } from '@/services/jobDiscovery.service';
import { fetchAndParseJobUrl } from '@/services/facebook/facebookUrlFetcher.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json().catch(() => ({}));

    const rawJobsToIngest: Array<{
      sourcePostId?: string;
      content: string;
      title?: string;
      company?: string;
      postUrl?: string;
      location?: string;
      employmentType?: string;
      salary?: string;
      postedAt?: Date;
    }> = [];

    // 1. Process explicitly provided URLs (Compliant User Ingestion)
    if (body && Array.isArray(body.urls) && body.urls.length > 0) {
      for (const url of body.urls) {
        if (typeof url === 'string' && url.trim().startsWith('http')) {
          const parsed = await fetchAndParseJobUrl(url.trim());
          rawJobsToIngest.push({
            content: parsed.rawContent,
            title: parsed.title,
            company: parsed.company,
            postUrl: parsed.url,
            location: parsed.location,
            employmentType: parsed.workType,
          });
        }
      }
    }

    // 2. Process explicitly provided post objects
    if (body && Array.isArray(body.posts) && body.posts.length > 0) {
      for (const p of body.posts) {
        if (p && typeof p.content === 'string' && p.content.trim()) {
          rawJobsToIngest.push({
            sourcePostId: p.sourcePostId || undefined,
            content: p.content.trim(),
            title: p.title || undefined,
            company: p.company || undefined,
            postUrl: p.postUrl || undefined,
            location: p.location || undefined,
            employmentType: p.employmentType || undefined,
            salary: p.salary || undefined,
            postedAt: p.postedAt ? new Date(p.postedAt) : undefined,
          });
        }
      }
    }

    // 3. Official Meta Graph API: Query user's connected Pages for newly published job posts
    const metaToken = await getDecryptedMetaToken(userId);
    let metaSource = 'No Meta account connected';

    if (metaToken) {
      try {
        const pages = await getMetaUserPages(metaToken);
        metaSource = `Checked ${pages.length} Meta Page(s)`;

        for (const page of pages) {
          const pagePosts = await fetchPageFeedPosts(page.id, page.accessToken);
          for (const post of pagePosts) {
            if (post.message && post.message.trim().length > 20) {
              rawJobsToIngest.push({
                sourcePostId: post.id,
                content: post.message,
                company: page.name,
                postUrl: post.permalinkUrl,
                postedAt: post.createdTime ? new Date(post.createdTime) : undefined,
              });
            }
          }
        }
      } catch (metaErr) {
        console.warn('[Meta Sync] Could not fetch Page feed:', metaErr);
      }
    }

    if (rawJobsToIngest.length === 0) {
      return NextResponse.json({
        success: true,
        message: metaToken
          ? 'Sync completed. No new job postings found in connected Meta Pages. You can also paste post links directly.'
          : 'Sync completed. Connect your Meta account in Integrations or input Facebook post links to discover jobs.',
        metaSource,
        totalProcessed: 0,
        newDiscovered: 0,
        matchedCount: 0,
        jobs: [],
      });
    }

    // 4. Ingest, deduplicate, calculate match scores, and save to DB
    const result = await ingestDiscoveredJobs(userId, rawJobsToIngest);

    return NextResponse.json({
      success: true,
      message: `Sync completed: Processed ${result.totalProcessed} posts, discovered ${result.newDiscovered} new opportunities (${result.matchedCount} strong profile matches).`,
      metaSource,
      ...result,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
