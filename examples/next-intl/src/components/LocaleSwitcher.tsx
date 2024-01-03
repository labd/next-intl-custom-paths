import { useLocale, useTranslations } from "next-intl";
import { locales } from "../config";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

export default function LocaleSwitcher() {
	const t = useTranslations("LocaleSwitcher");
	const locale = useLocale();

	return (
		<LocaleSwitcherSelect defaultValue={locale} label={t("label")}>
			{locales.map((cur) => (
				<option key={cur} value={cur}>
					{/* ICU Messageformat does not allow a hyphen */}
					{t("locale", { locale: cur.replace("-", "_") })}
				</option>
			))}
		</LocaleSwitcherSelect>
	);
}
