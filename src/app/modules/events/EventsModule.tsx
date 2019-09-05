import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./EventsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { ContextNaturalKey, Event, Community, Group } from '../../types/intrasocial_types';
import EventsMenu, { EventsMenuData } from './EventsMenu';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import EventListItem from './EventListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { EventSorting } from './EventsMenu';
import { ButtonGroup, Button } from 'reactstrap';
import { CommonModuleProps } from '../Module';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:EventsMenuData
}
type ReduxStateProps = {
    community: Community
    event: Event
    group: Group
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class EventsModule extends React.Component<Props, State> {
    tempMenuData:EventsMenuData = null
    eventsList = React.createRef<ListComponent<Event>>()
    static defaultProps:CommonModuleProps = {
        pageSize:15,
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                sorting:EventSorting.date,
                upcoming:true
            }
        }
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.eventsList = null
    }
    shouldReloadList = (prevProps:Props) => {
        return this.props.community && prevProps.community && this.props.community.id != prevProps.community.id
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldReloadList(prevProps) || this.contextDataChanged(prevState.menuData, prevProps))
        {
            this.eventsList.current.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    menuDataUpdated = (data:EventsMenuData) => {
        this.tempMenuData = data
    }
    contextDataChanged = (prevData:EventsMenuData, prevProps:Props) => {
        const data = this.state.menuData
        return prevData.sorting != data.sorting || prevData.upcoming != data.upcoming
    }
    fetchEvents = (offset:number, completion:(items:PaginationResult<Event>) => void ) => {
        let ordering = this.state.menuData.sorting
        let upcoming = this.state.menuData.upcoming
        const communityId = this.props.community && this.props.community.id
        const eventId = this.props.event ? this.props.event.id : null
        const groupId = this.props.group ? this.props.group.id : null
        ApiClient.getEvents(communityId, eventId, groupId, this.props.pageSize, offset, ordering, upcoming, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderEvent = (event:Event) =>  {
        return <EventListItem key={event.id} event={event} />
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
    toggleSorting = (sorting: EventSorting) => (e) => {
        const md = {
            sorting: sorting,
            upcoming: this.state.menuData.upcoming
        }
        this.setState({menuData:md})
    }
    renderSorting = () => {
        if(this.state.menuVisible)
            return null
        const ddi: OverflowMenuItem[] = EventSorting.all.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.toggleSorting(s),
                title:EventSorting.translatedText(s),
                iconClass:EventSorting.icon(s),
            }
        })

        const title = EventSorting.translatedText(this.state.menuData.sorting)
        return <DropDownMenu triggerIcon={EventSorting.icon(this.state.menuData.sorting)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    renderContent = () => {
        return <>
            {!this.props.community && <LoadingSpinner key="loading"/>}
            {this.props.community && <ListComponent<Event>
                loadMoreOnScroll={!this.props.showLoadMore}
                ref={this.eventsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchEvents} renderItem={this.renderEvent} />}
            </>
    }
    renderModalContent = () => {
        return <EventsModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, pageSize, showLoadMore, showInModal, isModal, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("events-module", className)
        const menu = <EventsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        const headerContent = this.renderSorting()
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
                    showHeaderTitle={!isModal}
                    renderModalContent={renderModalContent}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    headerContent={headerContent}
                    headerTitle={this.props.event ? translate("events.module.sessions") : translate("events.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    const event = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.EVENT) as Event
    const group = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.GROUP) as Group
    return {
        community,
        event,
        group
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(EventsModule))