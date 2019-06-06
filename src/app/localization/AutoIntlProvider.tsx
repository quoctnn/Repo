import * as React from "react";
import {IntlProvider, addLocaleData} from "react-intl";
import messages from "./messages";
import { connect } from 'react-redux'

import * as en from 'react-intl/locale-data/en';
import * as es from 'react-intl/locale-data/es';
import * as nb from 'react-intl/locale-data/nb';
import "moment/locale/en-gb";
import "moment/locale/es";
import "moment/locale/nb";
import * as moment from 'moment-timezone';
import { availableLanguages } from "../../app/redux/language";
import { ReduxState } from "../../app/redux";
addLocaleData([...en, ...es, ...nb]);

type Props = {
    language: number,
}
var private_messages = null
export const translate = (key:string):string => {
    let messages = private_messages
    if(key in messages)
        return messages[key]
    console.error("'" + key + "'" + " is missing from translations")
    return key
}
class AutoIntlProvider extends React.Component<Props, {}> {
    componentWillMount()
    {
        let lang = availableLanguages[this.props.language]
        private_messages = messages[lang]
        moment.locale(lang)
    }
    componentWillUpdate(nextProps:Props, nextState)
    {
        let lang = availableLanguages[nextProps.language]
        private_messages = messages[lang]
        moment.locale(lang)
    }
    render() {
        let lang = availableLanguages[this.props.language]
        return(
            <IntlProvider locale={lang} messages={messages[lang]}>
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