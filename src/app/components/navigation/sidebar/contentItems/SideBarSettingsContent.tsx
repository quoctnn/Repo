import * as React from "react";
import ThemeSelector from "./ThemeSelector";
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
        return (<div style={{marginRight: "16px"}}>
            <ThemeSelector/>
        </div>)
    }
}
