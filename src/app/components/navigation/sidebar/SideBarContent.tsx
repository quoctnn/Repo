import * as React from "react";
import "./SideBarContent.scss";
import { ContextDataProps, withContextData } from '../../../hoc/WithContextData';
import { RouteComponentProps, withRouter } from 'react-router';
import classnames from 'classnames';
import { ContextMenuItem, MenuItem } from '../../../types/menuItem';
type State = {
}

type Props = {
    menuItems: MenuItem[] | ContextMenuItem[]
    active:string
    onClose:(e: React.MouseEvent) => void

} & ContextDataProps & RouteComponentProps<any>

class SideBarContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            backButton: null
        }
    }

    componentDidMount = () => {
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        return true
    }

    render = () => {
        const menuItem = this.props.menuItems.find(item => item.index == this.props.active)
        const animation = this.props.active !== undefined ? "animate-open" : "animate-close"
        const cn = classnames("col-3 sidebar-content", animation)
        return(
            <div className={cn}>
                {menuItem && menuItem.content &&
                    <>{React.cloneElement(menuItem.content, {onClose: this.props.onClose})}</>
                }
            </div>
        )
    }
}

export default withContextData(withRouter(SideBarContent))
