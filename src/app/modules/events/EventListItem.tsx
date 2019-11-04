import * as React from 'react'
import classnames from "classnames"
import "./EventListItem.scss"
import { Event, ContextNaturalKey } from '../../types/intrasocial_types';
import { eventCover, stringToDateFormat, DateFormat } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';
import { translate } from '../../localization/AutoIntlProvider';

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
        return (<IntraSocialLink to={event} type={ContextNaturalKey.EVENT} {...rest} className={eventClass}>
                    <div className="drop-shadow">
                        <div className="top">
                            <SecureImage className="img" setBearer={true} setAsBackground={true} url={cover}/>
                            <div className="title-row d-flex align-items-center flex-row">
                                <div className="title text-truncate flex-grow-1">
                                    {event.name}
                                </div>
                                <div className="event-date theme-box">
                                    {stringToDateFormat( event.start , DateFormat.day)}
                                </div>
                            </div>
                        </div>
                        <div className="bottom d-flex align-items-center flex-row justify-content-around">
                            <div className="item">
                                <div className="item-top"><b>{event.attending_count}&nbsp;</b></div>
                                <div className="item-bottom">{translate("event.going")}</div>
                            </div>
                            <div className="item">
                                <div className="item-top"><b>{event.not_attending_count}&nbsp;</b></div>
                                <div className="item-bottom">{translate("event.not_going")}</div>
                            </div>
                            <div className="item">
                                <div className="item-top"><b>{event.invited_count}&nbsp;</b></div>
                                <div className="item-bottom">{translate("event.invited")}</div>
                            </div>
                        </div>
                    </div>
                </IntraSocialLink>)
    }
}