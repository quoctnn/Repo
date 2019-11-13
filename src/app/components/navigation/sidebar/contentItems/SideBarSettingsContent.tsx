import * as React from "react";
import ThemeSelector from "./ThemeSelector";
import { translate } from '../../../../localization/AutoIntlProvider';
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
                    {translate("Settings")}
                    <div className="sidebar-subtitle">
                        {translate("Global user settings")}
                    </div>
                </div>
            </div>
            <div className="sidebar-content-list" style={{marginRight: "8px"}}>
                <ThemeSelector/>
            </div>
        </>)
    }
}
