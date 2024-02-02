import PageLayout from "components/PageLayout";
import { Link, getPathname } from "navigation";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

type Props = {
	params: { locale: string };
};

export default function IndexPage({ params: { locale } }: Props) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations("IndexPage");

	const path = getPathname({ href: "/pathnames" });

	return (
		<PageLayout title={t("title")}>
			<p>Hello!</p>
			<Link className="inline-block bg-white p-4 rounded-md" href="/pathnames">
				{path} link
			</Link>
			<p className="max-w-[590px]">
				{t.rich("description", {
					code: (chunks) => (
						<code className="font-mono text-white">{chunks}</code>
					),
				})}
			</p>
		</PageLayout>
	);
}
