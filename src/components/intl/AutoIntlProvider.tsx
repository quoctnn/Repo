import * as React from "react";
import {IntlProvider, addLocaleData} from "react-intl";
import messages from "../../intl/messages";
import { connect } from 'react-redux'

import * as en from 'react-intl/locale-data/en';
import * as es from 'react-intl/locale-data/es';
import * as no from 'react-intl/locale-data/no';

addLocaleData([...en, ...es, ...no]);

export interface Props {
    language?: string,
    availableLanguages?: Array<string>

}

class AutoIntlProvider extends React.Component<Props, {}> {
    
    render() {
        let lang = this.props.availableLanguages[this.props.language]
        return(
            <IntlProvider locale={lang} messages={messages[lang]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
const mapStateToProps = (state) => {
    return { 
      language:state.settings.language,
      availableLanguages:state.settings.availableLanguages
    };
}
  
export default connect(mapStateToProps, null)(AutoIntlProvider);