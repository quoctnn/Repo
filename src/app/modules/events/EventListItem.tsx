import * as React from 'react'
import classnames from "classnames"
import "./EventListItem.scss"
import { Event, IntraSocialType } from '../../types/intrasocial_types';
import { eventCover, stringToDate, DateFormat } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    event:Event
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class EventListItem extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
            
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.event != this.props.event
        return ret

    }
    render()
    {
        const {event, className, children, ...rest} = this.props
        const eventClass = classnames("event-list-item", className)
        const cover = eventCover(event, true)
        return (<IntraSocialLink to={event} type={IntraSocialType.event} {...rest} className={eventClass}>
                    <div className="drop-shadow">
                        <SecureImage className="top img" setBearer={true} setAsBackground={true} url={cover}>
                            <div className="flex-grow-1"></div>
                            <div className="event-date theme-box theme-bg-gradient">
                                {stringToDate( event.end , DateFormat.day)}
                            </div>
                        </SecureImage>
                        <div className="bottom d-flex align-items-center flex-row">
                            <div className="theme-box theme-bg-gradient flex-shrink-0">
                                {event.attendees_count || "--"}&nbsp;
                                <i className="fa fa-user"></i>
                            </div>
                            <div className="title text-truncate">{event.name}</div>
                        </div>
                    </div>
                </IntraSocialLink>)
    }
}