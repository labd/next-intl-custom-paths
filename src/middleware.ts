import createNextIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

type Options = {
	locales: string[];
	defaultLocale: string;
	pathLocaleMap: Record<string, string>;
	localizedPaths: Record<string, string>;
	useLocaleForRoot: boolean;
};

export const createNextIntlCustomPathMiddleware = (options: Options) => {
	const intlMiddleware = createNextIntlMiddleware({
		locales: options.locales,
		defaultLocale: options.defaultLocale,
		localeDetection: false,
		alternateLinks: true,
		localePrefix: "always",
	});

	// Transform localizedPaths for faster lookups
	const localizedPaths: Record<string, Record<string, string>> = {};
	for (const [key, values] of Object.entries(options.localizedPaths)) {
		for (const [locale, word] of Object.entries(values)) {
			if (!localizedPaths[locale]) {
				localizedPaths[locale] = {};
			}
			localizedPaths[locale][word] = key;
		}
	}

	const resolvePathLocale = (path: string): string | undefined => {
		if (options.pathLocaleMap[path]) {
			return options.pathLocaleMap[path];
		}
	};

	const resolveLocaleToPath = (locale: string): string | undefined =>
		Object.keys(options.pathLocaleMap).find(
			(key) => options.pathLocaleMap[key] === locale
		);

	return (request: NextRequest): NextResponse<unknown> => {
		if (request.nextUrl.pathname === "/" && options.useLocaleForRoot) {
			const path = resolveLocaleToPath(options.defaultLocale);
			const url = new URL(`/${path}`, request.nextUrl.origin);
			return NextResponse.redirect(url, 308);
		}

		const [, localePart, ...rest] = request.nextUrl.pathname.split("/");
		const locale = resolvePathLocale(localePart);
		const pathWithoutLocale = rest.join("/");

		if (locale) {
			const path = localizedPaths[locale]?.[pathWithoutLocale] ?? pathWithoutLocale;
			const mappedURL = new URL(`/${locale}/${path}`, request.nextUrl.origin);
			const newRequest = new NextRequest(mappedURL, request as Request);
			return intlMiddleware(newRequest);
		}

		// If the full locale was used in the path, then we can redirect to the
		// short locale path variant
		if (resolveLocaleToPath(localePart)) {
			const url = new URL(
				`/${resolveLocaleToPath(localePart)}/${pathWithoutLocale}`,
				request.nextUrl.origin
			);
			return NextResponse.redirect(url, 308);
		}

		// No locale was found in the path, so we can redirect to the default
		const url = new URL(
			`/${resolveLocaleToPath(options.defaultLocale)}/${pathWithoutLocale}`,
			request.nextUrl.origin
		);
		const newRequest = new NextRequest(url, request as Request);
		return intlMiddleware(newRequest);
	};
};
