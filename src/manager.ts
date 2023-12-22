type Options = {
	locales: string[];
	defaultLocale: string;
	languageTags: Record<string, string>;
	localizedPaths: Record<string, Record<string, string>>;
};

type LocalePath = {
	locale: string;
	path: string;
	fullPath: string;
	localized: string;
	exactMatch: boolean;
};

export class LocaleManager {
	constructor(private options: Options) {}

	locales(): string[] {
		return this.options.locales ?? [];
	}

	defaultLocale(): string {
		return this.options.defaultLocale;
	}

	// Get the language tag from a locale
	fromLanguageTag(locale: string): string | undefined {
		if (this.options.languageTags[locale]) {
			return this.options.languageTags[locale];
		}
		if (this.options.locales.includes(locale)) {
			return locale;
		}
	}

	toLanguageTag(languageTag: string): string | undefined {
		return Object.keys(this.options.languageTags).find(
			(key) => this.options.languageTags[key] === languageTag
		);
	}

	// Translate a native path to a localized path
	toLocalizedPath(locale: string, path: string): string {
		const localizedPaths = this.options.localizedPaths[locale];
		const prefix =
			this.toLanguageTag(locale) ?? this.toLanguageTag(this.defaultLocale());
		if (!localizedPaths) {
			return `/${prefix}${path}`;
		}
		return `/${prefix}${localizedPaths[path] ?? path}`;
	}

	// Parse a localized path into a locale and internal path
	parseLocalizedPath(path: string): LocalePath | undefined {
		// Short-circuit for root path
		if (path === "/") {
			const locale = this.defaultLocale();
			return {
				locale: locale,
				path: "",
				fullPath: `/${locale}/`,
				exactMatch: false,
				localized: `/${this.toLanguageTag(locale)}/`,
			};
		}

		const [, languageTag, ...rest] = path.split("/");
		const locale = this.fromLanguageTag(languageTag);
		if (!locale) {
			return undefined;
		}

		const internalPath =
			this.fromLocalizedPath(locale, `/${rest.join("/")}`) ??
			`/${rest.join("/")}`;
		const localizedPath = this.toLocalizedPath(locale, internalPath);

		const normalizePath = (path: string) =>
			path.endsWith("/") ? path.slice(0, -1) : path;

		return {
			locale,
			path: internalPath,
			fullPath: "/" + locale + internalPath,
			exactMatch: normalizePath(path) === normalizePath(localizedPath),
			localized: localizedPath,
		};
	}

	fromLocalizedPath(locale: string, path: string): string {
		const localizedPaths = this.options.localizedPaths[locale];
		if (!localizedPaths) {
			return path;
		}
		const nativePath = Object.keys(localizedPaths).find(
			(key) => localizedPaths[key] === path
		);
		return nativePath ?? path;
	}
}
