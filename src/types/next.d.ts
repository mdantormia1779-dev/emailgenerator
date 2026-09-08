declare module 'next/server' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly cookies: any;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
  }

  export class NextResponse extends Response {
    readonly cookies: any;
    static json<T = any>(body: T, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static rewrite(destination: string | URL): NextResponse;
    static next(init?: any): NextResponse;
  }
}

declare module 'next/server.js' {
  export * from 'next/server';
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/types.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/types' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/dist/*';

