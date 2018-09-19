import * as React from "react";
import {IntlProvider, addLocaleData} from "react-intl";
import messages from "../../intl/messages";
import { connect } from 'react-redux'

import * as en from 'react-intl/locale-data/en';
import * as es from 'react-intl/locale-data/es';
import * as no from 'react-intl/locale-data/no';
import { availableLanguages } from '../../reducers/settings';
import { RootState } from "../../reducers";
addLocaleData([...en, ...es, ...no]);

export interface Props {
    language: string,
}
var private_messages = null
export const translate = (key:any) => {
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
    }
    componentWillUpdate(nextProps, nextState)
    {
        let lang = availableLanguages[nextProps.language]
        private_messages = messages[lang]
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
interface StateFromProps {
    language: string;
}
const mapStateToProps = (state:RootState) => {
    return {
        language:state.settings.language,
    };
}
  
export default connect<StateFromProps>(mapStateToProps, null)(AutoIntlProvider);