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
	const {
		usePathname: useNextIntlPathname,
		Link: NextIntlLink,
		useRouter: useNextIntlRouter,
	} = createLocalizedPathnamesNavigation({
		locales,
		localePrefix,
		pathnames,
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

	const Link = ({
		locale,
		...props
	}: Parameters<typeof NextIntlLink>[0] & {
		locale?: Locales[number] | undefined;
	}) => {
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
	};

	// Not much needed right now it seems
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
			) => {
				console.log(
					"Replacing",
					href,
					options,
					mapToPathLocale(currentLocale, options ?? {})
				);
				return router.replace(
					href,
					mapToPathLocale(
						currentLocale,
						// TODO: Use correct mapping
						options ?? {}
					)
				);
			},
			push: (
				href: Parameters<typeof router.push>[0],
				options:
					| (Parameters<typeof router.push>[1] & {
							locale?: AllLocales[number];
					  })
					| undefined
			) => {
				console.log("Pushing", href, options);
				return router.push(href, mapToPathLocale(currentLocale, options ?? {}));
			},
		};
	};

	return {
		usePathname,
		useRouter,
		Link,
	};
}
