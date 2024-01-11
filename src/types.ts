import createNextIntlMiddleware from "next-intl/middleware";

// Helper type to get the arguments for a function
export type ArgsType<T> = T extends (...args: infer U) => any ? U : never;

export type NextIntlMiddlewareOptions = Partial<
	ArgsType<typeof createNextIntlMiddleware>[0]
>;

export type AllLocales = ReadonlyArray<string>;
