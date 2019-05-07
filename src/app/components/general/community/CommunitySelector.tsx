import * as React from 'react';
import { connect } from 'react-redux'
import { Community } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux/index';
import "./CommunitySelector.scss"
import { translate } from '../../../localization/AutoIntlProvider';
import { DropdownItem } from 'reactstrap';
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from '../OverflowMenu';
import { CommunityManager } from '../../../managers/CommunityManager';
import ApiClient from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';

export interface OwnProps
{
}
interface ReduxStateProps
{
    mainCommunity:number,
    communities:number[]
}
type Props = ReduxStateProps & OwnProps
export interface State {
    communities:Community[]
}
class UserStatusSelector extends React.Component<Props, State> {
    observers:any[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            communities:[]
        }
    }
    componentDidMount()
    {
        var communities = this.props.communities.map((id, i) => {
            return CommunityManager.getCommunity(id.toString())
        })
        this.setState({communities})
    }
    componentWillUnmount()
    {
    }
    setMainCommunity = (community:Community) => (e:React.SyntheticEvent<any>) => {
        if (community)
            ApiClient.setMainCommunity(community.id, () => {
                // TODO: Move Toast to eventlistener 'eventstream_community.main'
                ToastManager.showInfoToast(translate("Main community changed"), community.name)
            })
    }
    showAllCommunities = () => (event: React.SyntheticEvent<any>) => {
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
        return (
            <div className="m-2">
                <div className="dropdown margin-right-sm d-flex">
                    <a data-boundary="body" className="dropdown-toggle text-truncate" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </a>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {selectableDropdownItems.map((dd, index) => {
                            return createDropdownItem(dd)
                        }) }
                        <DropdownItem divider={true}/>
                        <DropdownItem title={translate("community.list")} toggle={false} onClick={this.showAllCommunities()}>{translate("community.list")}</DropdownItem>
                    </div>
                </div>
            </div>
        )
    }
    render()
    {
        return(
            <span id="community-selector">
                {this.renderCommunitySelector()}
            </span>
        );
    }
}

const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const mainCommunity = state.activeCommunity.activeCommunity
    const communities = state.communityStore.allIds
    return {
        mainCommunity,
        communities
    }
}
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(UserStatusSelector)