import * as React from "react";
import { ContextDataProps, withContextData } from '../../../hoc/WithContextData';
import { RouteComponentProps, withRouter } from 'react-router';
import classnames from 'classnames';
type State = {
}

type Props = {
    title:string
    index:string
    active:string
    addMenuItem:(index:string) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
} & ContextDataProps & RouteComponentProps<any>

class SideBarItem extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            this.props.addMenuItem(this.props.index)
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
