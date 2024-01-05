import { LocaleManager } from "manager";
import createNextIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Helper type to get the arguments for a function
export type ArgsType<T> = T extends (...args: infer U) => any ? U : never;

type NextIntlMiddlewareOptions = Partial<
	ArgsType<typeof createNextIntlMiddleware>[0]
>;

type Options = {
	localeManager: LocaleManager;
	useLocaleForRoot: boolean;
	// Allow updating the middlewareOptions
	nextIntlMiddlewareOptions?: NextIntlMiddlewareOptions;
};

export const createNextIntlCustomPathMiddleware = (options: Options) => {
	const m = options.localeManager;
	if (!m) {
		throw new Error("LocaleManager is required");
	}

	const localePrefix: NextIntlMiddlewareOptions["localePrefix"] =
		options.nextIntlMiddlewareOptions?.localePrefix ?? options.useLocaleForRoot
			? "always"
			: "as-needed";

	const intlMiddleware = createNextIntlMiddleware({
		locales: m.locales(),
		defaultLocale: m.defaultLocale(),
		localeDetection: false,
		alternateLinks: true,
		localePrefix,
		...options.nextIntlMiddlewareOptions,
	});

	return (request: NextRequest): NextResponse<unknown> => {
		const parsed = m.parseLocalizedPath(request.nextUrl.pathname);
		console.log("Enabled locales", m.locales());

		console.log(
			"parsed",
			parsed?.fullPath,
			request.nextUrl.pathname,
			"exact match?",
			parsed?.exactMatch
		);

		if (parsed?.fullPath && parsed?.exactMatch) {
			const url = new URL(parsed.fullPath, request.nextUrl.origin);
			const newRequest = new NextRequest(url, request as Request);
			const middlewareResponse = intlMiddleware(newRequest);
			return middlewareResponse;
		}

		if (request.nextUrl.pathname === "/" && localePrefix === "always") {
			const url = new URL(`${parsed?.fullPath}`, request.nextUrl.origin);

			return NextResponse.redirect(url, 308);
		}

		if (parsed?.exactMatch) {
			const url = new URL(parsed.fullPath, request.nextUrl.origin);
			console.log("exact match", parsed.fullPath);
			const newRequest = new NextRequest(url, request as Request);
			const middlewareResponse = intlMiddleware(newRequest);

			// TODO: Work on setting proper Link headers

			// if (
			// 	middlewareResponse.headers &&
			// 	middlewareResponse.headers.has("Link")
			// ) {
			// 	// Rewrite link headers
			// 	const linkHeaders = middlewareResponse.headers.get("Link")?.split(",");
			// 	if (linkHeaders) {
			// 		console.log("Found linkheaders", linkHeaders);
			// 		linkHeaders?.map((link) => {
			// 			console.log(link);
			// 			return link.replaceAll("/nl-NL", "/nl");
			// 		});

			// 		middlewareResponse.headers.set("Link", linkHeaders?.join(","));
			// 	}

			// 	console.log("Link headers", middlewareResponse.headers.get("Link"));
			// }
			return middlewareResponse;
		}

		// If not an exact match, then we redirect
		if (parsed && !parsed.exactMatch) {
			const url = new URL(parsed.localized, request.nextUrl.origin);
			return NextResponse.redirect(url, 308);
		}

		// No internal match? just use intlMiddleware
		return intlMiddleware(request);
	};
};
