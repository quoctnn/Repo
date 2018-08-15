import * as React from "react";
import {IntlProvider, addLocaleData} from "react-intl";
import messages from "../../intl/messages";
import { connect, State } from 'react-redux'

import * as en from 'react-intl/locale-data/en';
import * as es from 'react-intl/locale-data/es';
import * as no from 'react-intl/locale-data/no';

addLocaleData([...en, ...es, ...no]);

export interface Props {
    language: string,
    availableLanguages?: Array<string>,

}
var private_messages = null
export const translate = (key:any) => {
    let messages = private_messages
    if(key in messages)
        return messages[key]
    return key
}
class AutoIntlProvider extends React.Component<Props, {}> {
    componentWillMount()
    {
        let lang = this.props.availableLanguages[this.props.language]
        private_messages = messages[lang]
    }
    componentWillUpdate(nextProps, nextState)
    {
        let lang = nextProps.availableLanguages[nextProps.language]
        private_messages = messages[lang]
    }
    render() {
        let lang = this.props.availableLanguages[this.props.language]
        return(
            <IntlProvider locale={lang} messages={messages[lang]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
interface StateFromProps {
    language: string;
    availableLanguages: string[];
}
const mapStateToProps = (state:State) => {
    return {
        language:state.settings.language,
        availableLanguages:state.settings.availableLanguages
    };
}
  
export default connect<StateFromProps>(mapStateToProps, null)(AutoIntlProvider);