import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./GroupsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Group, Community, GroupSorting } from '../../types/intrasocial_types';
import GroupsMenu, { GroupsMenuData } from './GroupsMenu';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import GroupListItem from './GroupListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { ButtonGroup, Button } from 'reactstrap';
import { CommonModuleProps } from '../Module';
import SimpleGroupListItem from './SimpleGroupListItem';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
export enum GroupsRenderMode {
    simple, normal
}
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
}
type DefaultProps = {
    sorting:GroupSorting
    showHeader:boolean
    renderMode:GroupsRenderMode
    excludeCommunityFilter:boolean
    allowListDivider:boolean
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:GroupsMenuData
}
type ReduxStateProps = {
    community: Community
    group: Group
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps & DefaultProps
class GroupsModule extends React.Component<Props, State> {
    tempMenuData:GroupsMenuData = null
    groupsList = React.createRef<ListComponent<Group>>()
    static defaultProps:DefaultProps = {
        pageSize:15,
        sorting:GroupSorting.recent,
        showHeader:true,
        renderMode:GroupsRenderMode.normal,
        excludeCommunityFilter:false,
        allowListDivider:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                sorting:props.sorting
            }
        }
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.groupsList = null
    }
    shouldReloadList = (prevProps:Props) => {
        return !this.props.excludeCommunityFilter && this.props.community && prevProps.community && this.props.community.id != prevProps.community.id
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldReloadList(prevProps) || this.contextDataChanged(prevState.menuData, prevProps))
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
    contextDataChanged = (prevData:GroupsMenuData, prevProps:Props) => {
        const data = this.state.menuData
        return prevData.sorting != data.sorting
    }
    fetchGroups = (offset:number, completion:(items:PaginationResult<Group>) => void ) => {
        let ordering = this.state.menuData.sorting
        const communityId = this.props.excludeCommunityFilter ? null : this.props.community && this.props.community.id
        const groupId = this.props.group && this.props.group.id
        ApiClient.getGroups(communityId, groupId, this.props.pageSize, offset, ordering, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderGroup = (group:Group) =>  {
        if(this.props.renderMode == GroupsRenderMode.simple)
            return <SimpleGroupListItem key={group.id} group={group}/>
        return <GroupListItem key={group.id} group={group} />
    }
    renderContent = () => {
        if(this.props.excludeCommunityFilter || this.props.community)
            return <ListComponent<Group> allowDivider={this.props.allowListDivider} loadMoreOnScroll={!this.props.showLoadMore} ref={this.groupsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchGroups} renderItem={this.renderGroup} />
        return <LoadingSpinner key="loading"/>
    }
    onMenuToggle = (visible:boolean) => {
        const newState:Partial<State> = {}
        newState.menuVisible = visible
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    toggleSorting = (sorting: GroupSorting) => (e) => {
        const md = {sorting: sorting}
        this.setState({menuData:md})
    }
    renderSorting = () => {
        if(this.state.menuVisible)
            return null
        const ddi: OverflowMenuItem[] = GroupSorting.all.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.toggleSorting(s),
                title:GroupSorting.translatedText(s),
                iconClass:GroupSorting.icon(s),
            }
        })
        const title = GroupSorting.translatedText(this.state.menuData.sorting)
        return <DropDownMenu triggerIcon={GroupSorting.icon(this.state.menuData.sorting)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    renderModalContent = () => {
        return <GroupsModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, pageSize, showLoadMore, showInModal, isModal, showHeader, sorting, renderMode, excludeCommunityFilter, allowListDivider,  ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("groups-module", className)
        const menu = <GroupsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        const headerContent = this.renderSorting()
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
                    showHeader={showHeader}
                    showHeaderTitle={!isModal}
                    renderModalContent={renderModalContent}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    headerContent={headerContent}
                    headerTitle={this.props.group ? translate("groups.module.subgroups") : translate("groups.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    const group = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.GROUP) as Group
    return {
        community,
        group
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupsModule))