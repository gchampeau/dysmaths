import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {isValidLocale, routing, type AppLocale} from "@/i18n/routing";
import {messagesByLocale} from "@/messages";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const safeLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const messages = messagesByLocale[safeLocale];

  return {
    title: messages.Metadata.title,
    description: messages.Metadata.description
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale as AppLocale);
  const messages = await getMessages();

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
