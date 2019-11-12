import * as React from "react";
import classnames from 'classnames';
import { MenuItem } from '../../../../types/menuItem';
import { translate } from '../../../../localization/AutoIntlProvider';
import { ReduxState } from "../../../../redux";
import { Community } from '../../../../types/intrasocial_types';
import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import "./SideBarCommunityItem.scss";
import { withContextData, ContextDataProps } from '../../../../hoc/WithContextData';
import SideBarCommunityContent from "./SideBarCommunityContent";

type State = {
    menuItem: MenuItem
    query: string
    communities: Community[]
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarCommunityItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            menuItem: undefined,
            query: "",
            communities: []
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: translate("common.core.community"),
                subtitle: undefined,
                content: <SideBarCommunityContent/>
            }
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        this.props.addMenuItem(this.state.menuItem)
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const changedFocus = (this.props.active == this.props.index || nextProps.active == this.props.index) && this.props.active != nextProps.active
        const newCommunity = (this.props.contextData.community && nextProps.contextData.community && this.props.contextData.community.id != nextProps.contextData.community.id) || (nextProps.contextData.community && !this.props.contextData.community) || (this.props.contextData.community && !nextProps.contextData.community)
        const search = this.state.query != nextState.query
        const updatedCommunities = this.state.communities.length != nextState.communities.length
        const changedActive = this.props.activeCommunity != nextProps.activeCommunity
        return changedFocus || search || updatedCommunities || changedActive || newCommunity
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

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {

    const activeCommunity = CommunityManager.getActiveCommunity();
    return {
        activeCommunity
    }
}
export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarCommunityItem))