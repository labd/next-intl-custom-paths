import { createLocalizedNavigation } from "@labdigital/next-intl-custom-paths";
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import {
	defaultLocale,
	localePrefix,
	localePrefixForRoot,
	locales,
	pathToLocaleMapping,
	pathnames,
} from "./config";

export const {
	usePathname: useTestPathname,
	Link: NextIntlLink,
	redirect: nextIntlRedirect,
	useRouter: useTestRouter,
} = createLocalizedPathnamesNavigation({
	locales,
	pathnames,
	localePrefix,
});

export const { usePathname, useRouter, Link, redirect, getPathname } =
	createLocalizedNavigation(
		locales,
		defaultLocale,
		localePrefix,
		localePrefixForRoot,
		pathToLocaleMapping,
		pathnames,
	);
