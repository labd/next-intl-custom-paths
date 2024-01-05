import { AllLocales, NextIntlMiddlewareOptions, localeToPath } from "new";
import { useLocale } from "next-intl";
import {
	Pathnames,
	createLocalizedPathnamesNavigation,
} from "next-intl/navigation";

type Locale = AllLocales[number];

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
	const { usePathname: useNextIntlPathname, Link: NextIntlLink } =
		createLocalizedPathnamesNavigation({
			locales,
			localePrefix,
			pathnames,
		});

	const Link = ({
		locale,
		...props
	}: Parameters<typeof NextIntlLink>[0] & { locale?: Locale | undefined }) => {
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
	const usePathname: () => keyof PathnamesConfig = () => useNextIntlPathname();

	return {
		usePathname,
		Link,
	};
}
