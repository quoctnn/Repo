
import * as ReactIntl from "react-intl";
declare global {
    interface Window { app: any; ReactIntlLocaleData:Array<any>, Intl:any, CSS:CSS, store:any}
    interface Navigator { browserLanguage: string; }
    interface String {
        hashCode(): number;
        splice(idx:number, rem:number, str:string):string;
    }
    interface Array<T> 
    {
        move(oldIndex, newIndex) : void
    }

}

export default class Intl {
    static getCurrentLocale() 
    { 
        // Get the user set language if available
        if (window.app && window.app.user_locale) {
            if (window.app.user_locale === "no") window.app.user_locale = "nb";
            return window.app.user_locale
        }

        // https://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference/29106129#29106129
        var nav = window.navigator,
            browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
            i,
            language;

        // support for HTML 5.1 "navigator.languages"
        if (Array.isArray(nav.languages)) {
            for (i = 0; i < nav.languages.length; i++) {
                language = nav.languages[i];
                if (language && language.length) {
                    return language;
                }
            }
        }
        // support for other well known properties in browsers
        for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                return language;
            }
        }

        return (navigator.language || navigator.browserLanguage);
    }
    static getCurrentLocalePrefix() 
    { 
        return Intl.getCurrentLocale().slice(0, 2);
    }
    static translate(intl:ReactIntl.InjectedIntl, key:string) 
    { 
        return intl.formatMessage({id:key, defaultMessage:key})
    }
}