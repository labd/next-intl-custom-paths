import { LocaleManager } from "./manager";
import { describe, expect, it } from "vitest";

describe("manager", () => {
	const m = new LocaleManager({
		defaultLocale: "en-GB",
		locales: ["nl-NL", "en-GB", "de-DE"],
		languageTags: {
			nl: "nl-NL",
			en: "en-GB",
			de: "de-DE",
		},
		localizedPaths: {
			"nl-NL": {
				"/about": "/over-ons",
				"/cart": "/winkelwagen",
				"/my-account/orders": "/mijn-account/bestellingen",
			},
			"de-DE": {
				"/about": "/ueber-uns",
				"/cart": "/warenkorb",
				"/my-account/orders": "/mein-konto/bestellungen",
			},
		},
	});

	it("fromLanguageTag()", () => {
		expect(m.fromLanguageTag("nl")).toBe("nl-NL");
		expect(m.fromLanguageTag("foobar")).toBeUndefined();
	});

	it("toLocalizedPath()", () => {
		expect(m.toLocalizedPath("nl-NL", "/about")).toBe("/nl/over-ons");
		expect(m.toLocalizedPath("nl-NL", "/my-account/orders")).toBe(
			"/nl/mijn-account/bestellingen"
		);
		expect(m.toLocalizedPath("nl-NL", "/foobar")).toBe("/nl/foobar");

		expect(m.toLocalizedPath("en-GB", "/about")).toBe("/en/about");
		expect(m.toLocalizedPath("en-GB", "/my-account/orders")).toBe(
			"/en/my-account/orders"
		);
		expect(m.toLocalizedPath("en-GB", "/foobar")).toBe("/en/foobar");

		// Fallback
		expect(m.toLocalizedPath("fr-FR", "/about")).toBe("/en/about");
		expect(m.toLocalizedPath("fr-F", "/my-account/orders")).toBe(
			"/en/my-account/orders"
		);
	});
});

describe("manager.parseLocalizedPath()", () => {
	const m = new LocaleManager({
		defaultLocale: "en-GB",
		locales: ["nl-NL", "en-GB", "de-DE"],
		languageTags: {
			nl: "nl-NL",
			en: "en-GB",
			de: "de-DE",
		},
		localizedPaths: {
			"nl-NL": {
				"/about": "/over-ons",
				"/cart": "/winkelwagen",
				"/my-account/orders": "/mijn-account/bestellingen",
			},
			"de-DE": {
				"/about": "/ueber-uns",
				"/cart": "/warenkorb",
				"/my-account/orders": "/mein-konto/bestellungen",
			},
		},
	});

	it("should handle path localization", () => {
		expect(m.parseLocalizedPath("/")).toEqual({
			locale: "en-GB",
			path: "",
			fullPath: "/en-GB/",
			localized: "/en/",
			exactMatch: false,
		});

		expect(m.parseLocalizedPath("/nl/over-ons")).toEqual({
			locale: "nl-NL",
			path: "/about",
			fullPath: "/nl-NL/about",
			localized: "/nl/over-ons",
			exactMatch: true,
		});
		expect(m.parseLocalizedPath("/nl/winkelwagen")).toEqual({
			locale: "nl-NL",
			path: "/cart",
			fullPath: "/nl-NL/cart",
			localized: "/nl/winkelwagen",
			exactMatch: true,
		});
		expect(m.parseLocalizedPath("/nl/mijn-account/bestellingen")).toEqual({
			locale: "nl-NL",
			path: "/my-account/orders",
			fullPath: "/nl-NL/my-account/orders",
			localized: "/nl/mijn-account/bestellingen",
			exactMatch: true,
		});

		expect(m.parseLocalizedPath("/en/about")).toEqual({
			locale: "en-GB",
			path: "/about",
			fullPath: "/en-GB/about",
			localized: "/en/about",
			exactMatch: true
		});
		expect(m.parseLocalizedPath("/en/cart")).toEqual({
			locale: "en-GB",
			path: "/cart",
			fullPath: "/en-GB/cart",
			localized: "/en/cart",
			exactMatch: true
		});
		expect(m.parseLocalizedPath("/en/my-account/orders")).toEqual({
			locale: "en-GB",
			path: "/my-account/orders",
			fullPath: "/en-GB/my-account/orders",
			localized: "/en/my-account/orders",
			exactMatch: true
		});

		expect(m.parseLocalizedPath("/de/foobar")).toEqual({
			locale: "de-DE",
			path: "/foobar",
			fullPath: "/de-DE/foobar",
			localized: "/de/foobar",
			exactMatch: true
		});
		expect(m.parseLocalizedPath("/fr/foobar")).toBeUndefined();
	});

	it("should support full-locale", () => {
		expect(m.parseLocalizedPath("/nl-NL/over-ons")).toEqual({
			locale: "nl-NL",
			path: "/about",
			fullPath: "/nl-NL/about",
			localized: "/nl/over-ons",
			exactMatch: false,
		});
	});
});
