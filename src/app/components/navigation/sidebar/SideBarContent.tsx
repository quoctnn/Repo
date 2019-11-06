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
} & ContextDataProps & RouteComponentProps<any>

class SideBarContent extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount = () => {

    }
    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }
    render = () => {
        const menuItem = this.props.menuItems.find(item => item.index == this.props.active)
        const animation = this.props.active !== undefined ? "animate-open" : "animate-close"
        const cn = classnames("col-3 sidebar-content", animation)
        return(
            <div className={cn}>
                <div className="sidebar-content-header">
                    <div className="sidebar-title">
                        {menuItem && menuItem.title}
                    </div>
                </div>
                <div className="sidebar-content-list">
                    {menuItem &&
                        menuItem.children.map((item) => {return item})
                    }
                </div>
            </div>
        )
    }
}

export default withContextData(withRouter(SideBarContent))
