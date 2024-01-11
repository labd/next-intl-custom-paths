/* eslint-disable no-mixed-spaces-and-tabs */
import { AllLocales, NextIntlMiddlewareOptions, localeToPath } from "new";
import { useLocale } from "next-intl";
import {
	Pathnames,
	createLocalizedPathnamesNavigation,
} from "next-intl/navigation";

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
		...props
	}: Parameters<typeof NextIntlLink>[0] & {
		locale?: AllLocales[number] | undefined;
	}) {
		const currentLocale = useLocale();
		const bcp47Locale = locale ?? currentLocale;
		return (
			<NextIntlLink
				{...props}
				locale={
					bcp47Locale === defaultLocale
						? undefined
						: localeToPath(bcp47Locale, pathToLocaleMapping)
				}
			/>
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
		};
	};

	return {
		usePathname,
		useRouter,
		Link,
	};
}
