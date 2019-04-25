import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./EventsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { ContextNaturalKey, Event, Community } from '../../types/intrasocial_types';
import EventsMenu, { EventsMenuData } from './EventsMenu';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import EventListItem from './EventListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:EventsMenuData
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class EventsModule extends React.Component<Props, State> {  
    tempMenuData:EventsMenuData = null   
    eventsList = React.createRef<ListComponent<Event>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
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
            this.eventsList.current.reload()
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
    menuDataUpdated = (data:EventsMenuData) => {
        this.tempMenuData = data
    }
    fetchEvents = (offset:number, completion:(items:PaginationResult<Event>) => void ) => {
        const communityId = this.props.community && this.props.community.id
        ApiClient.getEvents(communityId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderEvent = (event:Event) =>  {
        return <EventListItem key={event.id} event={event} />
    }
    onMenuToggle = (visible:boolean) => {

        const newState:Partial<State> = {}
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    renderContent = () => {
        return <>
            {!this.props.community && <LoadingSpinner key="loading"/>}
            {this.props.community && <ListComponent<Event> 
                ref={this.eventsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchEvents} renderItem={this.renderEvent} />}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("events-module", className)
        const menu = <EventsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    title={translate("events.module.title")}>
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
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(EventsModule))