import * as React from "react";
import { translate } from '../../../../localization/AutoIntlProvider';
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import EndpointSelector from "./EndpointSelector";
import "./SideBarSettingsContent.scss";

type State = {
}

type OwnProps = {
}

type Props = OwnProps

export default class SideBarSettingsContent extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            menuItem:undefined
        }
    }

    componentDidMount = () => {
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }

    render = () => {
        return (<>
            <div className="sidebar-content-header">
                <div className="sidebar-title">
                    {translate("sidebar.settings.title")}
                    <div className="sidebar-subtitle">
                        {translate("sidebar.settings.subtitle")}
                    </div>
                </div>
            </div>
            <div className="sidebar-content-list" style={{marginRight: "8px"}}>
                <ThemeSelector/>
                <LanguageSelector/>
                <EndpointSelector/>
            </div>
        </>)
    }
}
