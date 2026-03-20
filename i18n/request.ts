import {getRequestConfig} from "next-intl/server";
import {messagesByLocale} from "@/messages";
import {isValidLocale, routing} from "@/i18n/routing";

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale]
  };
});
