import * as React from "react";
import { connect } from 'react-redux'
import "./EventPage.scss"
import { Event, Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import { DashboardWithData } from "../../DashboardWithData";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { communityAvatar, communityName, eventCover } from "../../utilities/Utilities";
import { EventManager } from "../../managers/EventManager";
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    community:Community
    communityResolved:number
    eventid:string
    event:Event
    eventResolved:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class EventPage extends React.Component<Props, State> 
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    renderLoading = () => 
    {
        return (<LoadingSpinner />)
    }
    renderHeader(event:Event, community:Community)
    {
        return (<PageHeader 
                    coverImage={eventCover(event)} 
                    primaryItemImage={communityAvatar(community, true)} 
                    primaryItemTitle={communityName(community)}  
                    />
                )
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const {event, eventResolved, community, communityResolved} = this.props
        const hasData = !!event && !!community
        const isLoading = (!event && !eventResolved) || (!community && !communityResolved)
        return(
            <div id="event-page" className="dashboard-container">
                {isLoading && this.renderLoading()}
                {!isLoading && !hasData && this.renderNotFound()}
                {hasData && 
                    <div className="content dashboard-container">
                        {this.renderHeader(event, community)}
                        <DashboardWithData category="event" />
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const eventid:string = ownProps.match.params.eventname
    const event = EventManager.getEvent(eventid)
    const eventResolved = state.resolvedContext.eventResolved

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    const communityResolved = state.resolvedContext.communityResolved
    return {
        community,
        communityResolved,
        eventid,
        event,
        eventResolved,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(EventPage);