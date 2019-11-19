import * as React from "react";
import { ReduxState } from "../../../../redux";
import { connect } from 'react-redux';
import { AppLanguage } from '../../../../types/intrasocial_types';
import { setLanguageAction } from '../../../../redux/language';
import { translate } from '../../../../localization/AutoIntlProvider';

type ReduxStateProps = {
    language: AppLanguage;
}
type ReduxDispatchProps = {
    setLanguage?: (language: AppLanguage) => void;
}

type Props = ReduxStateProps & ReduxDispatchProps

class LanguageSelector extends React.PureComponent<Props, {}> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <div className={"d-flex settings-item language-selector"}>
                <div className="flex-grow-1">{translate("common.language")}</div>
                <div className="dropdown">
                    <button
                    className="btn btn-secondary dropdown-toggle text-truncate"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    >
                    {AppLanguage.translationForKey( this.props.language )}
                    </button>

                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {AppLanguage.all.map((lang) => {
                        return (
                        <a
                            key={lang}
                            onClick={() => {
                            this.props.setLanguage(lang);
                            }}
                            className="dropdown-item"
                            href="#"
                        >
                            {AppLanguage.translationForKey(lang)}
                        </a>
                        );
                    })}
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state: ReduxState) => {
    return {
        language: state.language.language
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setLanguage:(language:AppLanguage) => {
            dispatch(setLanguageAction(language));
        },
    };
}

export default connect<ReduxStateProps, ReduxDispatchProps, {}>(mapStateToProps, mapDispatchToProps)(LanguageSelector);
