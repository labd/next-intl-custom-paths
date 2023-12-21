import createNextIntlMiddleware from "next-intl/middleware";
import type { NextResponse } from "next/server";
import { NextRequest } from "next/server";

type Options = {
	locales: string[];
	defaultLocale: string;
	pathLocaleMap: Record<string, string>
};


export const createNextIntlCustomPathMiddleware = (options: Options) => {
	const intlMiddleware = createNextIntlMiddleware({
		locales: options.locales,
		defaultLocale: options.defaultLocale,
		localeDetection: false,
		alternateLinks: true,
		localePrefix: "always",
	});

	const resolvePathLocale = (path: string): string | undefined =>
	options.pathLocaleMap[path];

	return (request: NextRequest): NextResponse<unknown> => {
		const [, localePart, ...rest] = request.nextUrl.pathname.split("/");
		const locale = resolvePathLocale(localePart);
		if (locale) {
			const mappedURL = new URL(
				`/${locale}/${rest.join("/")}`,
				request.nextUrl.origin,
			);
			const newRequest = new NextRequest(mappedURL, request as Request);
			return intlMiddleware(newRequest);
		} else {
			const mappedURL = new URL(
				`/${options.defaultLocale}/${rest.join("/")}`,
				request.nextUrl.origin,
			);
			const newRequest = new NextRequest(mappedURL, request as Request);
			return intlMiddleware(newRequest);
		}
	};
};
