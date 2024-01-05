// New solution

import createNextIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Helper type to get the arguments for a function
export type ArgsType<T> = T extends (...args: infer U) => any ? U : never;

type NextIntlMiddlewareOptions = Partial<
	ArgsType<typeof createNextIntlMiddleware>[0]
>;

type AllLocales = ReadonlyArray<string>;

type MiddlewareOptions<Locales extends AllLocales> = {
	locales: Locales;
	defaultLocale: Locales[number];
	pathToLocaleMapping: Record<string, Locales[number]>;
	nextIntlMiddlewareOptions: NextIntlMiddlewareOptions;
};

export function createNewIntlCustomPathMiddleware<Locales extends AllLocales>({
	locales,
	defaultLocale,
	pathToLocaleMapping,
	nextIntlMiddlewareOptions,
}: MiddlewareOptions<Locales>) {
	return (request: NextRequest) => {
		if (
			new Set(Object.values(pathToLocaleMapping)).size !==
			Object.values(pathToLocaleMapping).length
		) {
			// Having a path map to multiple locales would lead to weird issues, block it here
			throw new Error("Duplicate locale path mapping");
		}

		console.log("Default locale is", defaultLocale);

		const intlMiddleware = createNextIntlMiddleware({
			locales,
			defaultLocale,
			...nextIntlMiddlewareOptions,
		});

		// Redirect to the default locale path if the root is requested and the localePrefix is set to always
		if (
			request.nextUrl.pathname === "/" &&
			nextIntlMiddlewareOptions.localePrefix === "always"
		) {
			const url = new URL(
				`/${localeToPath(defaultLocale, pathToLocaleMapping)}`,
				request.nextUrl.origin
			);
			return NextResponse.redirect(url, 308);
		}

		return intlRegex.test(request.nextUrl.pathname)
			? handlePathLocale(request, intlMiddleware, pathToLocaleMapping)
			: NextResponse.next();
	};
}

function pathToLocale(
	pathLocale: string,
	mapping: Record<AllLocales[number], string>
): AllLocales[number] {
	// const localePath = localeToPath(pathLocale, mapping);
	// if (localePath) {
	// 	return localePath;
	// }
	return mapping[pathLocale];
}

function localeToPath(
	locale: AllLocales[number],
	mapping: Record<AllLocales[number], string>
): string | undefined {
	const match = Object.entries(mapping).find((item) => item[1] === locale);

	if (match) {
		return match[0];
	}
}

function handlePathLocale(
	request: NextRequest,
	intlMiddleware: (request: NextRequest) => NextResponse<unknown>,
	pathToLocaleMapping: Record<string, AllLocales[number]>
) {
	const pathLocale = request.nextUrl.pathname.split("/")[1];
	if (localeToPath(pathLocale, pathToLocaleMapping)) {
		// The path is actually the complete locale, we should replace this
		const mappedURL = new URL(
			request.nextUrl.pathname.replace(
				new RegExp(`^/${pathLocale}`),
				`/${localeToPath(pathLocale, pathToLocaleMapping)}`
			),
			request.nextUrl.origin
		);

		return NextResponse.redirect(mappedURL, 308);
	}
	const locale = pathToLocale(pathLocale, pathToLocaleMapping);

	if (pathLocale && locale) {
		const mappedURL = new URL(
			request.nextUrl.pathname.replace(
				new RegExp(`^/${pathLocale}`),
				`/${locale}`
			),
			request.nextUrl.origin
		);

		return intlMiddleware(new NextRequest(mappedURL, request as Request));
	} else {
		return intlMiddleware(request);
	}
}

const intlRegex = new RegExp("/((?!.*\\..*).*)");
