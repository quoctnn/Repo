import * as React from "react";
import { ReduxState } from "../../../../redux";
import { connect } from 'react-redux';
import { ThemeManager } from '../../../../managers/ThemeManager';
import { availableThemes } from '../../../../redux/theme';
import { translate } from '../../../../localization/AutoIntlProvider';

type ReduxStateProps = {
    theme: number;
}

class ThemeSelector extends React.PureComponent<ReduxStateProps, {}> {
    constructor(props: ReduxStateProps) {
        super(props)
    }

    render() {
        return (
            <div className={"d-flex settings-item theme-selector"}>
                <div className="settings-item-title flex-grow-1">{translate("Theme")}</div>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle text-truncate"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        {availableThemes[this.props.theme].name}
                    </button>

                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {availableThemes.map((theme, index) => {
                            return (
                                <a
                                    key={index}
                                    onClick={() => {
                                        ThemeManager.setTheme(index)
                                    }}
                                    className="dropdown-item"
                                    href="#"
                                >
                                    {theme.name}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState) => {
    return {
        theme: state.theme.theme
    };
};
export default connect<ReduxStateProps, {}, {}>(mapStateToProps, null)(ThemeSelector);
