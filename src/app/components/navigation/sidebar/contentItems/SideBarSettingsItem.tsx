import * as React from "react";
import classnames from 'classnames';
import { translate } from '../../../../localization/AutoIntlProvider';
import { MenuItem } from '../../../../types/menuItem';
import SideBarSettingsContent from "./SideBarSettingsContent";
type State = {
    menuItem:MenuItem
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
}
type Props = OwnProps

export default class SideBarSettingsItem extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            menuItem:undefined
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: "sidebar.settings.title",
                subtitle: "sidebar.settings.subtitle",
                content: <SideBarSettingsContent/>
            }
            this.props.addMenuItem(menuItem)
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        return this.props.active != nextProps.active
    }

    render = () => {
        const active = this.props.active == this.props.index
        const css = classnames("sidebar-item", {active: active})
        const iconCss = classnames("fa-circle", active ? "fa" : "far")
        return (
            <div id={this.props.index} className={css} onClick={this.props.onClick}>
                <i className={iconCss}></i>
                {translate("sidebar.settings.title")}
            </div>
        )
    }
}

