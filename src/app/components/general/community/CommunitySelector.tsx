import * as React from 'react';
import { connect } from 'react-redux'
import { Community } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux/index';
import "./CommunitySelector.scss"
import { translate } from '../../../localization/AutoIntlProvider';
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from '../OverflowMenu';
import { CommunityManager } from '../../../managers/CommunityManager';
import ApiClient from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import Routes from '../../../utilities/Routes';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DropDownMenu } from '../DropDownMenu';
import { Avatar } from '../Avatar';
import { communityAvatar } from '../../../utilities/Utilities';
import classnames = require('classnames');
import { Popover, PopoverBody } from 'reactstrap';

type OwnProps = {
}
type ReduxStateProps = {
    mainCommunity:Community,
    communities:number[]
}
type Props = ReduxStateProps & OwnProps & RouteComponentProps<any>
type State = {
    communities:Community[]
    popoverRemoved:boolean
    popoverVisible:boolean
}
class CommunitySelector extends React.Component<Props, State> {
    private triggerRef:HTMLElement = null
    constructor(props:Props) {
        super(props);
        this.state = {
            communities:[],
            popoverRemoved:true,
            popoverVisible:false,
        }
    }
    componentDidMount()
    {
        var communities = this.props.communities.map((id, i) => {
            return CommunityManager.getCommunity(id.toString())
        })
        this.setState({communities})
    }
    componentWillUnmount = () => {
    }
    setMainCommunity = (community:Community) => (e:React.SyntheticEvent<any>) => {
        if (community) {
            if (this.props.mainCommunity == community) {
                this.props.history.push(Routes.communityUrl(community.slug_name))
            } else {
                ApiClient.setMainCommunity(community.id, () => {
                    this.props.history.push(Routes.communityUrl(community.slug_name))
                })
            }
        }
    }
    showAllCommunities = (event: React.SyntheticEvent<any>) => {
        window.alert("Not implemented")
    }
    renderCommunitySelector = () =>
    {
        const selectableDropdownItems:OverflowMenuItem[] = this.state.communities.map((community, i) => {
            return {
                id:"community_" + community.id,
                type:OverflowMenuItemType.option,
                title: community.name,
                onPress:this.setMainCommunity(community),
                toggleMenu:false
            }
        })
        selectableDropdownItems.push({id:"divider1", type:OverflowMenuItemType.divider})
        selectableDropdownItems.push({id:"all", type:OverflowMenuItemType.option, title:translate("common.see.all"), onPress:this.showAllCommunities})
        return (
            <DropDownMenu triggerClass="fas fa-caret-down mx-1" items={selectableDropdownItems}></DropDownMenu>
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
        const selectableDropdownItems:OverflowMenuItem[] = this.state.communities.map((community, i) => {
            return {
                id:"community_" + community.id,
                type:OverflowMenuItemType.option,
                title: community.name,
                onPress:this.setMainCommunity(community),
                toggleMenu:false
            }
        })
        selectableDropdownItems.push({id:"divider1", type:OverflowMenuItemType.divider})
        selectableDropdownItems.push({id:"all", type:OverflowMenuItemType.option, title:translate("common.see.all"), onPress:this.showAllCommunities})
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
    const communities = state.communityStore.allIds
    return {
        mainCommunity,
        communities
    }
}
export default withRouter(connect(mapStateToProps, null)(CommunitySelector))