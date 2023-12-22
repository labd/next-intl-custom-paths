import { LocaleManager } from "./manager";
import createNextIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

type Options = {
	localeManager: LocaleManager;
	useLocaleForRoot: boolean;
};

export const createNextIntlCustomPathMiddleware = (options: Options) => {
	const m = options.localeManager;
	if (!m) {
		throw new Error("LocaleManager is required");
	}

	const intlMiddleware = createNextIntlMiddleware({
		locales: m.locales(),
		defaultLocale: m.defaultLocale(),
		localeDetection: false,
		alternateLinks: true,
		localePrefix: "always",
	});

	return (request: NextRequest): NextResponse<unknown> => {
		const parsed = m.parseLocalizedPath(request.nextUrl.pathname);
			console.log(parsed)

		if (request.nextUrl.pathname === "/" && options.useLocaleForRoot) {
			const url = new URL(`/${parsed?.fullPath}`, request.nextUrl.origin);
			return NextResponse.redirect(url, 308);
		}

		if (parsed?.exactMatch) {
			const url = new URL(parsed.fullPath, request.nextUrl.origin);
			const newRequest = new NextRequest(url, request as Request);
			return intlMiddleware(newRequest);
		}

		// If not an exact match, then we redirect
		if (parsed && !parsed.exactMatch) {
			const url = new URL(parsed.localized, request.nextUrl.origin);
			return NextResponse.redirect(url, 308);
		}

		return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
	};
};
