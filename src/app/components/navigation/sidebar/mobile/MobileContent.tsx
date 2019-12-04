import * as React from "react";
import "./MobileContent.scss";
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { RouteComponentProps, withRouter } from 'react-router';
import classnames from 'classnames';
import { ContextMenuItem, MenuItem } from '../../../../types/menuItem';
import { translate } from "../../../../localization/AutoIntlProvider";
type State = {
}

type Props = {
    menuItems: MenuItem[] | ContextMenuItem[]
    active:string
    onClose:(e: React.MouseEvent) => void
    onHide:(e: React.MouseEvent) => void
} & ContextDataProps & RouteComponentProps<any>

class MobileContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            backButton: null
        }
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        return true
    }

    render = () => {
        const menuItem = this.props.menuItems.find(item => item.index == this.props.active)
        const cn = classnames("col-3 mobile-content", {"open": !!this.props.active})
        return(
            <div className={cn}>
                <div className="footer">
                    <div className="click-container" onClick={this.props.onClose}>
                        <div className="spacer-left line"/>
                        {menuItem && <div className="footer-title">
                            {menuItem.title}
                        </div>}
                        <i className="fa fa-2x fa-caret-up"/>
                        <div className="spacer-right line"/>
                    </div>
                </div>
                {menuItem && menuItem.content &&
                    <>{React.cloneElement(menuItem.content, {onClose: this.props.onHide, reverse: true})}</>
                }
            </div>
        )
    }
}

export default withContextData(withRouter(MobileContent))
