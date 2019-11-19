import * as React from "react";
import classnames from 'classnames';
import { MenuItem } from '../../../../types/menuItem';
import { translate } from '../../../../localization/AutoIntlProvider';
import "../SideBarItem.scss";
import SideBarCommunityContent from "./SideBarCommunityContent";

type State = {
    menuItem: MenuItem
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void
    onClick:(e:React.MouseEvent) => void
    onClose:(e:React.MouseEvent) => void
}

type Props = OwnProps

export default class SideBarCommunityItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            menuItem: undefined
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: translate("common.core.community"),
                subtitle: undefined,
                content: <SideBarCommunityContent onClose={this.props.onClose}/>
            }
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        this.props.addMenuItem(this.state.menuItem)
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const changedFocus = (this.props.active == this.props.index || nextProps.active == this.props.index) && this.props.active != nextProps.active
        return changedFocus
    }

    render = () => {
        const active = this.props.active == this.props.index
        const css = classnames("sidebar-item", {active: active})
        const iconCss = classnames("fa-circle", active ? "fa" : "far")
        return (
            <div id={this.props.index} className={css} onClick={this.props.onClick}>
                <i className={iconCss}></i>
                {this.state.menuItem &&
                    this.state.menuItem.title
                    ||
                    translate("common.core.community")
                }
            </div>
        )
    }
}
