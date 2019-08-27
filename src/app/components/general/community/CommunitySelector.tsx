import * as React from 'react';
import { connect } from 'react-redux'
import { Community, ContextNaturalKey, UserProfile, ElasticSearchType } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux/index';
import "./CommunitySelector.scss"
import { translate } from '../../../localization/AutoIntlProvider';
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from '../OverflowMenu';
import { CommunityManager } from '../../../managers/CommunityManager';
import ApiClient from '../../../network/ApiClient';
import Routes from '../../../utilities/Routes';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Avatar } from '../Avatar';
import { communityAvatar, contextAvatar } from '../../../utilities/Utilities';
import classnames = require('classnames');
import { Popover, PopoverBody } from 'reactstrap';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
const sortDescendingVisited = (a:Community, b:Community) => {
    return new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime()
}
const sortDescendingVisits = (a:Community, b:Community) => {
    return b.visit_count - a.visit_count
}
type OwnProps = {
}
type ReduxStateProps = {
    mainCommunity:Community,
    topCommunities:Community[]
    recentCommunities:Community[],
    profile:UserProfile
}
type Props = ReduxStateProps & OwnProps & RouteComponentProps<any>
type State = {
    popoverRemoved:boolean
    popoverVisible:boolean
}
class CommunitySelector extends React.Component<Props, State> {
    private triggerRef:HTMLElement = null
    constructor(props:Props) {
        super(props);
        this.state = {
            popoverRemoved:true,
            popoverVisible:false,
        }
    }
    componentDidMount()
    {
    }
    componentWillUnmount = () => {
    }
    setMainCommunity = (community:Community) => (e:React.SyntheticEvent<any>) => {
        if (community) {
            if (this.props.mainCommunity == community) {
                this.props.history.push(Routes.communityUrl(community.slug_name))
            } else {
                if (this.props.profile.is_anonymous) {
                    CommunityManager.setInitialCommunity(community.id);
                    this.props.history.push(Routes.communityUrl(community.slug_name))
                } else {
                    ApiClient.setMainCommunity(community.id, () => {
                        this.props.history.push(Routes.communityUrl(community.slug_name))
                    })
                }
            }
        }
    }
    openCommunitySearch = () => {
        return (
            <Link className="clickable dropdown-item" to={{pathname:Routes.SEARCH, state:{modal:true}, search:"type=" + ElasticSearchType.COMMUNITY}}>{translate("common.see.all")}</Link>
        )
    }
    onTriggerClick = (e:React.SyntheticEvent) => {
        e.preventDefault()
        if(!this.state.popoverRemoved)
        {
            this.closePopoverPanel()
        }
        else {
            this.setState( (prevState) => {
                return {popoverRemoved:false, popoverVisible:true}
            })
        }
    }
    closePopoverPanel = () => {
        const completion = () => {
            setTimeout(() => {
                this.setState( (prevState) => {
                    return {popoverVisible:false, popoverRemoved:true}
                })
            }, 300)
        }
        this.setState( (prevState) => {
            return {popoverVisible:false}
        },completion)
    }
    renderPopover = () =>
    {
        const open = !this.state.popoverRemoved || this.state.popoverVisible
        if(!open)
            return null
        const selectableDropdownItems:OverflowMenuItem[] = this.props.topCommunities.map((community, i) => {
            return {
                id:"community_top" + community.id,
                type:OverflowMenuItemType.option,
                title: community.name,
                onPress:this.setMainCommunity(community),
                toggleMenu:false,
                children:<Avatar className="mr-1" size={24} image={contextAvatar(community, true, ContextNaturalKey.COMMUNITY)} />
            }
        })
        const recentCommunities = this.props.recentCommunities.map((community, i) => {
            return {
                id:"community_recent" + community.id,
                type:OverflowMenuItemType.option,
                title: community.name,
                onPress:this.setMainCommunity(community),
                toggleMenu:false,
                children:<Avatar className="mr-1" size={24} image={contextAvatar(community, true, ContextNaturalKey.COMMUNITY)} />
            }
        })
        if(recentCommunities.length > 0)
            selectableDropdownItems.push({id:"recent_header", title:translate("common.sorting.recent"), type:OverflowMenuItemType.header})
        selectableDropdownItems.push(...recentCommunities)
        selectableDropdownItems.push({id:"divider1", type:OverflowMenuItemType.divider})
        selectableDropdownItems.push({id:"all", type:OverflowMenuItemType.option, children:this.openCommunitySearch()})
        const cn = classnames("dropdown-menu-popover", "community-selector-dropdown")
        return <Popover className={cn}
                        delay={0}
                        trigger="legacy"
                        placement="bottom"
                        hideArrow={false}
                        isOpen={this.state.popoverVisible}
                        target={this.triggerRef}
                        toggle={this.closePopoverPanel}
                        >
                    <PopoverBody className="pl-0 pr-0">
                        {selectableDropdownItems.map(i => createDropdownItem(i, this.closePopoverPanel))}
                    </PopoverBody>
                </Popover>
    }
    render()
    {
        const image = communityAvatar(this.props.mainCommunity, true)
        return(
            <div id="community-selector" className="">
                <div className="trigger d-flex align-items-center" onClick={this.onTriggerClick} ref={(ref) => this.triggerRef = ref}>
                    <Avatar className="active-community-logo" image={image} size={40}/>
                    <i className="fas fa-caret-down mx-1"></i>
                </div>
                {this.renderPopover()}
            </div>
        );
    }
}

const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const mainCommunity = CommunityManager.getCommunityById(state.activeCommunity.activeCommunity)
    const allCommunities = state.communityStore.allIds.map(id => state.communityStore.byId[id])
    const topCommunities = allCommunities.sort(sortDescendingVisits).slice(0, 5)
    const topIds = topCommunities.map(tc => tc.id)
    const recentCommunities = allCommunities.filter(c => !!c.last_visited).sort(sortDescendingVisited).slice(0, 5).filter(rc => !topIds.contains(rc.id))
    const profile = AuthenticationManager.getAuthenticatedUser()
    return {
        mainCommunity,
        topCommunities,
        recentCommunities,
        profile
    }
}
export default withRouter(connect(mapStateToProps, null)(CommunitySelector))