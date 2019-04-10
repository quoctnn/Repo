import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Event } from '../../types/intrasocial_types2';
import { EventManager } from "../../managers/EventManager";
import LoadingSpinner from "../../components/general/LoadingSpinner";
require("./EventView.scss");
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    event:Event|null
    id:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
    loading:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class EventView extends React.Component<Props, State> 
{
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.event)
        {
            this.setState({loading:true}, () => {
                EventManager.ensureEventExists(this.props.id, () => {
                    this.setState({loading:false})
                })
            })
        }
    }
    renderLoading = () => 
    {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    renderEvent(event:Event)
    {
        return (
        <div className="content">
            <CoverImage src={event.cover || event.cover_cropped}>
                <div className="down-shadow profile-name text-truncate">
                    <h2 className="text-truncate">{event.name}</h2>
                </div>
            </CoverImage>
        </div>)
    }
    render() {
        const event = this.props.event
        return(
            <div id="event-view" className="col-sm">
                {this.renderLoading()}
                {event && this.renderEvent(event)}
                {!event && <div>NO EVENT</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    const eventid:string = ownProps.match.params.eventname
    const event = EventManager.getEvent(eventid)
    return {
        event,
        id:eventid
    }
}
export default connect(mapStateToProps, null)(EventView);