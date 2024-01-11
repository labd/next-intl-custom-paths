# @labdigital/next-intl-custom-paths

Opinionated wrapper around next-intl 3.0 for internationalization with custom paths.

This decouples the locale used in your codebase from the path. So for example `/en` can internally be used as `en-US`.

It's a bit opinionated and specific for our use cases for now:
- Only supports localized path names, see [cprussin's comment](https://github.com/amannn/next-intl/issues/653#issuecomment-1823273158) on how to set something like this up for shared pathnames
- Doesn't support saving the default locale based on cookie

Heavily inspired by https://github.com/amannn/next-intl/issues/653#issuecomment-1823273158, thanks @cprussin.

## Usage

In your middleware.ts add the following
```ts
import { createNextIntlCustomPathMiddleware } from "@labdigital/next-intl-custom-paths";

const intlMiddleware = createNextIntlCustomPathMiddleware({
		defaultLocale: "en-US",
		locales: ["en-US", "nl-NL", "de-DE"],
		pathToLocaleMapping: {
			"en": "en-US",
			"nl": "nl-NL",
			"de": "de-DE",
		}
	});
```

You can also edit all next-intl middleware arguments using the `nextIntlMiddlewareOptions` key, e.g.:

```ts
const intlMiddleware = createNextIntlCustomPathMiddleware({
		defaultLocale: "en-US",
		locales: ["en-US", "nl-NL", "de-DE"],
		pathToLocaleMapping: {
			"en": "en-US",
			"nl": "nl-NL",
			"de": "de-DE",
		},
		nextIntlMiddlewareOptions: {
			localeDetection: false,
			pathnames: {
				"/": "/"
			}
		}
	});

```

This package has it's own navigation helpers to translate path to locale, you should use these if you use our middleware:

```ts
import { createLocalizedNavigation } from "@labdigital/next-intl-custom-paths";

export const { usePathname, useRouter, Link } = createLocalizedNavigation(
	locales,
	defaultLocale,
	localePrefix,
	pathToLocaleMapping,
	pathnames,
);
```
