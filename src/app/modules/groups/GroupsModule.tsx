import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./GroupsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Group, Community } from '../../types/intrasocial_types';
import GroupsMenu, { GroupsMenuData } from './GroupsMenu';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import GroupListItem from './GroupListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    isLoading:boolean
    menuData:GroupsMenuData
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class GroupsModule extends React.Component<Props, State> {  
    tempMenuData:GroupsMenuData = null   
    groupsList = React.createRef<ListComponent<Group>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuData:{
            }
        }
    }
    shouldReloadList = (prevProps:Props) => {
        return this.props.community && prevProps.community && this.props.community.id != prevProps.community.id
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.shouldReloadList(prevProps))
        {
            this.groupsList.current.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:GroupsMenuData) => {
        this.tempMenuData = data
    }
    fetchGroups = (offset:number, completion:(items:PaginationResult<Group>) => void ) => {
        const communityId = this.props.community && this.props.community.id
        ApiClient.getGroups(communityId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderGroup = (group:Group) =>  {
        return <GroupListItem key={group.id} group={group} />
    }
    renderContent = () => {
        return <>
            {!this.props.community && <LoadingSpinner key="loading"/>}
            {this.props.community && <ListComponent<Group> ref={this.groupsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchGroups} renderItem={this.renderGroup} />}
            </>
    }
    onMenuToggle = (visible:boolean) => {
        console.log("menu open", visible)
        const newState:Partial<State> = {}
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("groups-module", className)
        const menu = <GroupsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    headerTitle={translate("groups.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupsModule))