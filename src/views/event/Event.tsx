import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Event } from "../../types/intrasocial_types";
require("./Event.scss");
export interface Props {
    match:any,
    eventsData:Event[]
}

class EventView extends React.Component<Props, {}> {
    getEvent(community:number, slug:string)
    {
        return this.props.eventsData.find((g) => g.community == community && g.slug == slug)
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
        let community = parseInt(this.props.match.params.communityid)
        let slug = this.props.match.params.eventname
        let event = this.getEvent(community,slug)
        return(
            <div id="event-view" className="col-sm">
                {event && this.renderEvent(event)}
                {!event && <div>NO EVENT</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        eventsData: state.eventStore.events,
    };
}
export default connect(mapStateToProps, null)(EventView);