/* eslint-disable no-mixed-spaces-and-tabs */
import { localeToPath } from "helpers";
import { useLocale } from "next-intl";
import {
	Pathnames,
	createLocalizedPathnamesNavigation,
} from "next-intl/navigation";
import { AllLocales, NextIntlMiddlewareOptions } from "types";

export function createHelpers(mapping: Record<AllLocales[number], string>) {
	return mapping;
}

/**
 * Create customized navigation helpers
 */
export function createLocalizedNavigation<
	Locales extends AllLocales,
	PathnamesConfig extends Pathnames<Locales>
>(
	locales: Locales,
	defaultLocale: Locales[number],
	localePrefix: NextIntlMiddlewareOptions["localePrefix"],
	localePrefixForRoot: "always" | "as-needed",
	pathToLocaleMapping: Record<string, Locales[number]>,
	pathnames: PathnamesConfig
) {
	// Hacky way to add both versions of locales to the pathnames object
	// Next-intl needs both the full locale and the language code in other parts of it's logic
	// so replicating both here
	const compatiblePathnames = Object.fromEntries(
		Object.entries(pathnames).map(([pathname, value]) => [
			pathname,
			typeof value === "string"
				? // Handle usecase where no locale is set for a path (and only a string)
				  value
				: // Handle usecase where a locale is set for a path (and an object)
				  Object.fromEntries(
						Object.entries<string>(value).flatMap(
							([locale, translatedPath]) => [
								[locale, translatedPath],
								[locale.split("-")[0], translatedPath],
							]
						)
				  ),
		])
	) as PathnamesConfig;

	const {
		usePathname: useNextIntlPathname,
		Link: NextIntlLink,
		useRouter: useNextIntlRouter,
		redirect: nextIntlRedirect,
	} = createLocalizedPathnamesNavigation({
		locales,
		localePrefix,
		pathnames: compatiblePathnames,
	});

	const mapToPathLocale = <T extends { locale?: AllLocales[number] }>(
		currentLocale: AllLocales[number],
		{ locale, ...options }: T
	): Omit<T, "locale"> & { locale?: string } => {
		const bcp47Locale = locale ?? currentLocale;
		return {
			...options,
			locale: localeToPath(bcp47Locale, pathToLocaleMapping),
		};
	};

	function Link({
		locale,
		children,
		...props
	}: Parameters<typeof NextIntlLink>[0] & {
		locale?: AllLocales[number] | undefined;
	}) {
		const currentLocale = useLocale();
		const wantLocale = locale ?? currentLocale;

		let localePath = localeToPath(wantLocale, pathToLocaleMapping);
		const { href } = props;

		// If the `localePrefixForRoot` is set to "as-needed" then we don't want to
		// include the locale path in the URL for the root page. So erase it
		if (
			localePrefixForRoot === "as-needed" &&
			wantLocale === defaultLocale &&
			href === "/"
		) {
			localePath = undefined;
		}

		return (
			<NextIntlLink {...props} locale={localePath}>
				{children}
			</NextIntlLink>
		);
	}

	// Adds compatibility for path locale
	const usePathname: () => keyof PathnamesConfig = () => {
		const pathname = String(useNextIntlPathname());
		const pathLocale = Object.keys(pathToLocaleMapping).find((locale) =>
			pathname.startsWith(`/${locale}`)
		);

		return pathLocale
			? pathname.replace(new RegExp(`^/${pathLocale}/?`), "/")
			: pathname;
	};

	const useRouter = () => {
		const currentLocale = useLocale();
		const router = useNextIntlRouter();

		return {
			...router,
			replace: (
				href: Parameters<typeof router.replace>[0],
				options: Parameters<typeof router.replace>[1] & {
					locale?: AllLocales[number];
				}
			) => router.replace(href, mapToPathLocale(currentLocale, options ?? {})),
			push: (
				href: Parameters<typeof router.push>[0],
				options:
					| (Parameters<typeof router.push>[1] & {
							locale?: AllLocales[number];
					  })
					| undefined
			) => router.push(href, mapToPathLocale(currentLocale, options ?? {})),
			prefetch: (
				href: Parameters<typeof router.prefetch>[0],
				options: Parameters<typeof router.prefetch>[1] & {
					locale?: AllLocales[number];
				}
			) => {
				router.prefetch(href, mapToPathLocale(currentLocale, options));
			},
		};
	};

	type RedirectHref = Parameters<typeof nextIntlRedirect>[0];

	const redirect = (href: RedirectHref) => {
		const currentLocale = useLocale();
		const parsedHref =
			typeof href === "object" && href.pathname
				? { ...href, pathname: String(href.pathname) }
				: { pathname: href as string };

		const pathLocale = Object.keys(pathToLocaleMapping).find((locale) =>
			parsedHref.pathname.startsWith(`/${locale}`)
		);

		if (!pathLocale) {
			parsedHref.pathname = `/${localeToPath(
				currentLocale,
				pathToLocaleMapping
			)}${parsedHref.pathname}`;
		}

		return nextIntlRedirect(parsedHref as RedirectHref);
	};

	return {
		usePathname,
		useRouter,
		Link,
		redirect,
	};
}
