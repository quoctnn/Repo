import * as React from "react";
import {IntlProvider} from "react-intl";
import messages from "./messages";
import { connect } from 'react-redux'

import "moment/locale/en-gb";
import "moment/locale/es";
import "moment/locale/nb";
import * as moment from 'moment-timezone';
import { ReduxState } from "../../app/redux";
import { AppLanguage } from "../types/intrasocial_types";

type Props = {
    language: AppLanguage,
}
var private_messages = null
export const lazyTranslate = (key:string) => {
    return () => translate(key)
}
export const translate = (key:string):string => {
    let messages = private_messages
    if(!messages)
    {
        console.warn("Translations not yet initialized")
        return key
    }
    if(key in messages)
        return messages[key]
    console.error("'" + key + "'" + " is missing from translations")
    return key
}
class AutoIntlProvider extends React.Component<Props, {}> {
    componentDidMount = () => {
        const lang = this.props.language
        private_messages = messages[lang]
        moment.locale(lang)
    }
    componentWillUpdate = (nextProps:Props, nextState) => {
        const lang = nextProps.language
        private_messages = messages[lang]
        moment.locale(lang)
    }
    render() {
        const lang = this.props.language
        const m = messages[lang]
        return(
            <IntlProvider locale={lang} messages={m}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
const mapStateToProps = (state:ReduxState) => {
    return {
        language:state.language.language,
    };
}

export default connect<Props>(mapStateToProps, null)(AutoIntlProvider);