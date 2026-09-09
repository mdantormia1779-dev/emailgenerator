import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getMetaAccountStatus, getMetaConfig, getDecryptedMetaToken, getMetaUserPages } from '@/services/meta.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const status = await getMetaAccountStatus(userId);
    const config = getMetaConfig();

    let pages: Array<{ id: string; name: string; category?: string }> = [];
    if (status.isConnected) {
      try {
        const token = await getDecryptedMetaToken(userId);
        if (token) {
          const userPages = await getMetaUserPages(token);
          pages = userPages.map(p => ({ id: p.id, name: p.name, category: p.category }));
        }
      } catch (err: any) {
        console.warn('[Meta Status] Could not fetch pages:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        isConfigured: Boolean(config.appId && config.appSecret),
        appId: config.appId ? `${config.appId.slice(0, 4)}...${config.appId.slice(-4)}` : null,
        pages,
      },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
