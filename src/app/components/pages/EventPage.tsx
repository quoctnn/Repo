import * as React from "react";
import { connect } from 'react-redux'
import "./EventPage.scss"
import { Event, Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { EventManager } from "../../managers/EventManager";
import { RouteComponentProps } from "react-router";
type OwnProps = {
    match:any,
} & RouteComponentProps<any>
interface ReduxStateProps
{
    community:Community
    event:Event
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
    componentDidMount = () => {
        if (this.props.event)
            EventManager.ensureEventExists(this.props.event.id, () => {}, true)
    }
    componentDidUpdate = (prevProps:Props) => {
        const p = prevProps.event
        const c = this.props.event
        const pPath = prevProps.location.pathname
        const cPath = this.props.location.pathname
        if(p && !c && pPath == cPath)
        {
            const obj = EventManager.getEventById(p.id)
            if(obj && obj.uri)
                window.app.navigateToRoute(obj.uri)

        }
    }
    renderLoading = () =>
    {
        return (<LoadingSpinner />)
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const {event, community} = this.props
        const hasData = !!event && !!community
        return(
            <div id="event-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
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

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    return {
        community,
        event,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(EventPage);