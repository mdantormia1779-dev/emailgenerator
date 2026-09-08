import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { processFacebookPosts } from '@/services/facebook/facebookScanner.service';
import { scanFeedPayloadSchema } from '@/services/facebook/facebook.schemas';
import { formatErrorResponse } from '@/lib/errors';
import { RawFacebookPostInput } from '@/services/facebook/facebook.types';

const SAMPLE_FACEBOOK_FEED: RawFacebookPostInput[] = [
  {
    content: `🚀 Urgent Hiring: MERN Stack Developer (Remote)
Company: Nexus Digital Innovations
Location: Remote (Worldwide)
Experience: 3+ years

We are actively looking for an experienced MERN Stack Developer to join our core product team!
Tech Stack:
- MongoDB, Express.js, React, Node.js
- RESTful APIs & GraphQL
- TypeScript & Next.js is a plus!

Please send your resume, portfolio link, and expected salary to:
careers@nexusdigital.io with subject "MERN Developer Application".`,
    postUrl: 'https://facebook.com/groups/webdevjobs/posts/10192837461',
    author: 'Nexus Digital HR',
  },
  {
    content: `📢 We're Hiring: Senior Frontend Developer
Company: BrightWave Media
Role: Frontend Engineer (React & TypeScript)

Requirements:
✓ React.js & Next.js
✓ TypeScript
✓ Tailwind CSS
✓ Responsive UI development
✓ Experience with state management (Redux/Zustand)

Drop your CV directly to hr@brightwavemedia.com.
Interviews start this week!`,
    postUrl: 'https://facebook.com/groups/reactjobs/posts/55489201923',
    author: 'BrightWave Recruiting',
  },
  {
    content: `Looking for an experienced Graphic Designer & Video Editor!
Must know Adobe Photoshop, Illustrator, and Premiere Pro.
Job Type: On-site (Dhanmondi, Dhaka)
Send portfolio to design@creativedesignstudio.com`,
    postUrl: 'https://facebook.com/groups/freelancebd/posts/88273918234',
    author: 'Creative Studio',
  },
  {
    content: `Full Stack Developer Needed for US Based Startup (Next.js + Node)
Must have proven track record with:
- Next.js (App router)
- TypeScript
- PostgreSQL & Prisma ORM
- Docker & Cloud Deployment

Contact us: talent@hyperflowtechnologies.com
Subject: Next.js Full Stack Dev`,
    postUrl: 'https://facebook.com/groups/nextjsdevelopers/posts/33918204921',
    author: 'Hyperflow Tech',
  },
];

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    let postsToProcess: RawFacebookPostInput[] = [];

    // Parse body if present
    try {
      const body = await req.json();
      if (body && Array.isArray(body.posts) && body.posts.length > 0) {
        const validated = scanFeedPayloadSchema.parse(body);
        postsToProcess = validated.posts;
      }
    } catch {
      // If empty body, fall back to sample feed simulation
    }

    // If no posts provided, load representative Facebook group posts
    if (postsToProcess.length === 0) {
      postsToProcess = SAMPLE_FACEBOOK_FEED;
    }

    const result = await processFacebookPosts(userId, postsToProcess);

    return NextResponse.json({
      success: true,
      message: `Scanned ${result.scanned} posts. Found ${result.relevantCount} relevant job(s) and prepared ${result.draftsCreated} email draft(s) for your review.`,
      data: result,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
