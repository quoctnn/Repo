import * as React from "react";
import { ContextDataProps, withContextData } from '../../../hoc/WithContextData';
import { RouteComponentProps, withRouter } from 'react-router';
import classnames from 'classnames';
import { MenuItem } from '../../../types/menuItem';
type State = {
    menuItem: MenuItem
}

type Props = {
    title:string
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
} & ContextDataProps & RouteComponentProps<any>

class SideBarItem extends React.Component<Props, State> {
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
                title: this.props.title || "No title",
                subtitle: undefined,
                content: undefined
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
                {this.props.title}
            </div>
        )
    }
}

export default withContextData(withRouter(SideBarItem))
