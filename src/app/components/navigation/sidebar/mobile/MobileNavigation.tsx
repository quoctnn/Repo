import "./MobileNavigation.scss";
import { withRouter, RouteComponentProps } from 'react-router';
import * as React from "react";
import classnames from 'classnames';
import { uniqueId } from '../../../../utilities/Utilities';
import SideBarSettingsItem from '../contentItems/SideBarSettingsItem';
import SideBarContent from "../SideBarContent";
import Avatar from '../../../general/Avatar';
import { ReduxState } from "../../../../redux";
import { CommunityManager } from '../../../../managers/CommunityManager';
import { Community } from '../../../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ContextMenuItem, MenuItem } from '../../../../types/menuItem';
import { Link } from "react-router-dom";
import SideBarCommunityItem from "../contentItems/SideBarCommunityItem";
import SideBarFavoriteItem from "../contentItems/SideBarFavoritesItem";
import SideBarGroupItem from "../contentItems/SideBarGroupItem";
import SideBarProjectItem from "../contentItems/SideBarProjectItem";
import SideBarEventItem from "../contentItems/SideBarEventItem";
import SideBarFilesItem from "../contentItems/SideBarFilesItem";
import SideBarContactsItem from "../contentItems/SideBarContactsItem";
import MobileContent from "./MobileContent";

type State = {
    active: string
    menuItems: MenuItem[] | ContextMenuItem[]
}

type ReduxStateProps = {
    activeCommunity: Community
}

type OwnProps = {
    visible: boolean
    hideMenu?: (e: React.MouseEvent) => void
}

type Props = OwnProps & RouteComponentProps & ReduxStateProps

class MobileNavigation extends React.Component<Props, State> {
    private uniqueClass = "has-side-menu-" + uniqueId();
    private contentRef = React.createRef<HTMLDivElement>()
    constructor(props: Props) {
        super(props)
        this.state = {
            active: undefined,
            menuItems: []
        }
        document.body.classList.add(this.uniqueClass)
    }

    componentWillUnmount = () => {
        document.body.classList.remove(this.uniqueClass)
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        return true
    }

    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if (this.state.active && !prevState.active)
            document.addEventListener('click', this.outsideTrigger)
        if (!this.state.active)
            document.removeEventListener('click', this.outsideTrigger)
    }

    outsideTrigger = (e:MouseEvent) => {
        if(!this.state.active)
            return
        const el = e.target as HTMLElement
        if(el && (this.contentRef.current && !this.contentRef.current.contains(el)) &&
               !el.classList.contains("title-button") &&
               (el.offsetParent && !el.offsetParent.classList.contains("popover")))
            this.closeMenu(null)
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

    closeMenu = (e: React.MouseEvent) => {
        this.setState({active: undefined})
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
        if (!this.props.visible) return null;
        const css = classnames("mobile-menu-root")
        const community = this.props.activeCommunity
        return (
            <div ref={this.contentRef}>
                <div className={css}>
                    <SideBarCommunityItem addMenuItem={this.addItem} index={"community-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    <SideBarFavoriteItem addMenuItem={this.addItem} index={"starred-menu"} active={this.state.active} onClick={this.selectionChanged}  />
                    <SideBarGroupItem addMenuItem={this.addItem} index={"groups-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    <SideBarProjectItem addMenuItem={this.addItem} index={"projects-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    <SideBarEventItem addMenuItem={this.addItem} index={"events-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    <SideBarFilesItem addMenuItem={this.addItem} index={"files-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    {/* <SideBarItem title="Notes" addMenuItem={this.addItem} index={"notes-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    {this.renderSpacing(true)} */}
                    <SideBarContactsItem addMenuItem={this.addItem} index={"contacts-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    <SideBarSettingsItem addMenuItem={this.addItem} index={"settings-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    {/* <div className="mobile-menu-separator"></div>
                    <SideBarItem title="Admin" addMenuItem={this.addItem} index={"admin-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    {this.renderSpacing(true)}
                    <SideBarItem title="Roles" addMenuItem={this.addItem} index={"roles-menu"} active={this.state.active} onClick={this.selectionChanged} />
                    {this.renderSpacing(true)}
                    <SideBarItem title="Stats" addMenuItem={this.addItem} index={"stats-menu"} active={this.state.active} onClick={this.selectionChanged} /> */}
                    <div className="mobile-menu-header-spacing"/>
                    <div className="mobile-menu-separator"/>
                    {community &&
                        <Link className="mobile-menu-root-header" to={community.uri}>
                            <div className="community-avatar text-center">
                                <Avatar size={40} image={community.avatar_thumbnail}></Avatar>
                            </div>
                            <div className="community-name text-center text-truncate">
                                <span>{community.name}</span>
                            </div>
                        </Link>
                    }
                </div>
                <MobileContent menuItems={this.state.menuItems} active={this.state.active} onClose={this.closeMenu} onHide={this.props.hideMenu}/>
            </div>
        )
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
        activeCommunity: CommunityManager.getActiveCommunity()
}
}

export default withRouter(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(MobileNavigation))
