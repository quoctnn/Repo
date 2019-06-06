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
import Routes from '../../../utilities/Routes';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

export interface OwnProps
{
}
interface ReduxStateProps
{
    mainCommunity:number,
    communities:number[]
}
type Props = ReduxStateProps & OwnProps & RouteComponentProps<any>
export interface State {
    communities:Community[]
}
class CommunitySelector extends React.Component<Props, State> {
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
    componentWillUnmount = () => {
    }
    setMainCommunity = (community:Community) => (e:React.SyntheticEvent<any>) => {
        if (community)
            ApiClient.setMainCommunity(community.id, () => {
                // TODO: Move Toast to eventlistener 'eventstream_community.main'
                ToastManager.showInfoToast(translate("Main community changed"), community.name)
                this.props.history.push(Routes.communityUrl(community.slug_name))
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
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {/*selectableDropdownItems.map((dd, index) => {
                            return createDropdownItem(dd)
                        }) */}
                        <DropdownItem divider={true}/>
                        <DropdownItem title={translate("common.see.all")} toggle={false} onClick={this.showAllCommunities()}>{translate("common.see.all")}</DropdownItem>
                    </div>
                </div>
            </div>
        )
    }
    render()
    {
        return(
            <div id="community-selector">
                {this.renderCommunitySelector()}
                {this.state.communities.map(c => {
                    return <Link className="d-block" to={c.uri}>{c.name}</Link>
                })}
            </div>
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
export default withRouter(connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(CommunitySelector))