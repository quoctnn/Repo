import "./SideBarNavigation.scss";
import { withRouter, RouteComponentProps } from 'react-router';
import * as React from "react";
import classnames from 'classnames';
import { uniqueId } from '../../../utilities/Utilities';
import SideBarItem from "./SideBarItem";
import SideBarSettingsItem from './contentItems/SideBarSettingsItem';
import SideBarContent from "./SideBarContent";
import Avatar from '../../general/Avatar';
import { ReduxState } from "../../../redux";
import { CommunityManager } from '../../../managers/CommunityManager';
import { Community } from '../../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ContextMenuItem, MenuItem } from '../../../types/menuItem';
import SideBarCommunityItem from "./contentItems/SideBarCommunityItem";

type State = {
    active: string
    menuItems: MenuItem[] | ContextMenuItem[]
}

type ReduxStateProps = {
    activeCommunity: Community
}

type OwnProps = {

}

type Props = OwnProps & RouteComponentProps & ReduxStateProps

class SideBarNavigation extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            active: undefined,
            menuItems: []
        }
        document.body.classList.add("has-side-menu-" + uniqueId())
    }

    componentDidMount = () => {

    }
    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        return true
    }
    renderSpacing = (withLine: boolean) => {
        const css = classnames("spacer", { line: withLine })
        return <div className={css}></div>
    }

    selectionChanged = (e: React.MouseEvent) => {
        if (this.state.active != e.currentTarget.id) {
            this.setState({ active: e.currentTarget.id })
        } else {
            this.setState({ active: undefined })
        }
    }

    addItem = (item: MenuItem | ContextMenuItem) => {
        var currentItems = this.state.menuItems
        const index = currentItems.findIndex((mi) => item.index === mi.index)
        if (index != -1)
            currentItems[index] = item
        else
            currentItems.push(item)
        this.setState({ menuItems: currentItems })
    }
    render() {
        const css = classnames("sidebar-root")
        const community = this.props.activeCommunity
        return (<>
            <div className={css}>
                <div className="sidebar-root-header">
                    <div className="community-avatar text-center">
                        {community &&
                            <Avatar size={40} image={community.avatar_thumbnail}></Avatar>
                        }
                    </div>
                    <div className="community-name text-center text-truncate">
                        {community &&
                            <span>{community.name}</span>
                        }
                    </div>
                </div>
                <div className="sidebar-separator"></div>
                <SideBarCommunityItem addMenuItem={this.addItem} index={"community-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(false)}
                <SideBarItem title="Starred" addMenuItem={this.addItem} index={"starred-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Groups" addMenuItem={this.addItem} index={"groups-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Projects" addMenuItem={this.addItem} index={"projects-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Events" addMenuItem={this.addItem} index={"events-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(false)}
                <SideBarItem title="Files" addMenuItem={this.addItem} index={"files-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Notes" addMenuItem={this.addItem} index={"notes-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Contacts" addMenuItem={this.addItem} index={"contacts-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarSettingsItem addMenuItem={this.addItem} index={"settings-menu"} active={this.state.active} onClick={this.selectionChanged} />

                <div className="sidebar-separator"></div>
                <SideBarItem title="Admin" addMenuItem={this.addItem} index={"admin-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Roles" addMenuItem={this.addItem} index={"roles-menu"} active={this.state.active} onClick={this.selectionChanged} />
                {this.renderSpacing(true)}
                <SideBarItem title="Stats" addMenuItem={this.addItem} index={"stats-menu"} active={this.state.active} onClick={this.selectionChanged} />
            </div>
            <SideBarContent menuItems={this.state.menuItems} active={this.state.active} />
        </>
        )
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
        activeCommunity: CommunityManager.getActiveCommunity()
    }
}

export default withRouter(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarNavigation))
