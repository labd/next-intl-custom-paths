import { createLocalizedNavigation } from "@labdigital/next-intl-custom-paths";
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import {
	defaultLocale,
	localePrefix,
	locales,
	pathToLocaleMapping,
	pathnames,
} from "./config";

export const {
	usePathname: useTestPathname,
	Link: NextIntlLink,
	redirect,
	useRouter: useTestRouter,
} = createLocalizedPathnamesNavigation({
	locales,
	pathnames,
	localePrefix,
});

export const { usePathname, useRouter, Link } = createLocalizedNavigation(
	locales,
	defaultLocale,
	localePrefix,
	pathToLocaleMapping,
	pathnames,
);
