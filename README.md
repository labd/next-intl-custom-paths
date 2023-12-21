# @labdigital/next-intl-custom-paths

Opinionated wrapper around next-intl 3.0 for internationalization with custom paths.
Heavily inspired by https://github.com/amannn/next-intl/issues/653#issuecomment-1823273158

## Usage

In your middleware.ts add the following
```ts
import { createNextIntlCustomPathMiddleware } from "@labdigital/next-intl-custom-paths";

const middleware = createNextIntlCustomPathMiddleware({
	locales: ["nl-NL", "en-GB"]
	defaultLocale: "nl-NL",
	pathLocaleMap: {
		nl: "nl-NL",
		en: "en-GB",
	},
});
```
