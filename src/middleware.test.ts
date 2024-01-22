import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { processRequest } from "./middleware";

describe("rewrite request for ", () => {
	it.each([
		["http://example.org/en", "/"], // no trailing slash
		["http://example.org/EN", "/"], // lower case no trailing slash
		["http://example.org/en-US", "/"], // no trailing slash
		["http://example.org/en-us", "/"], // lower case no trailing slash
		["http://example.org/en-US/", "/"], // trailing slash
		["http://example.org/en-us/", "/"], // lower case trailing slash
		["http://example.org/en-us/foobar/", "/en/foobar"], // lower case trailing slash
	])(
		"should redirect %s to %s if the root is requested for the default locale and localePrefix is set to as-needed",
		(input, expected) => {
			const request = new NextRequest(input);

			const result = processRequest(request, {
				defaultLocale: "en-US",
				localePrefixForRoot: "as-needed",
				pathToLocaleMapping: {
					en: "en-US",
					nl: "nl-NL",
					fr: "fr-FR",
				},
			});

			expect(result.statusCode).toBe(308);
			expect(result.targetURL?.pathname).toBe(expected);
		}
	);

	it.each([
		["http://example.org/", "/en"],
		["http://example.org/en-US", "/en"],
		["http://example.org/en-US/", "/en"],
		["http://example.org/en-US/foobar", "/en/foobar"],
	])(
		"should redirect %s to the locale path (%s) for the default locale and localePrefix is set to always",
		(input, expected) => {
			const request = new NextRequest(input);

			const result = processRequest(request, {
				defaultLocale: "en-US",
				localePrefixForRoot: "always",
				pathToLocaleMapping: {
					en: "en-US",
					nl: "nl-NL",
					fr: "fr-FR",
				},
			});

			expect(result.statusCode).toBe(308);
			expect(result.targetURL?.pathname).toBe(expected);
		}
	);

	it("should not redirect if no localePrefix is needed for the default locale", () => {
		const request = new NextRequest("http://example.org/");

		const result = processRequest(request, {
			defaultLocale: "en-US",
			localePrefixForRoot: "as-needed",
			pathToLocaleMapping: {
				en: "en-US",
				nl: "nl-NL",
				fr: "fr-FR",
			},
		});
		expect(result.request?.url).toBe("http://example.org/");
	});
});
