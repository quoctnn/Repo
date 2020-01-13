import * as React from 'react';
import classnames = require("classnames");
import { CalendarEvent } from "./CalendarModule";
import { Link } from "react-router-dom";
import * as moment from 'moment'
import { translate } from '../../localization/AutoIntlProvider';
import "./CalendarEventComponent.scss"
import { truncate, DateFormat } from '../../utilities/Utilities';
import { stringToDateFormat, uniqueId } from '../../utilities/Utilities';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';

const getStartTime = (date: Date, start: Date) => {
    const d = moment(date), s = moment(start)
    return (d.isSame(start, "day") ? s : s.startOf('day')).format("HH:mm")
}
const getEndTime = (date: Date, end: Date) => {
    const d = moment(date), e = moment(end)
    return (d.isSame(e, "day") ? e : e.endOf('day')).format("HH:mm")
}
const sameDay = (date: Date, start: Date) => {
    return date.getUTCFullYear() === start.getUTCFullYear() &&
        date.getUTCMonth() === start.getUTCMonth() &&
        date.getUTCDate() === start.getUTCDate();
}
export type CalendarEventComponent = {
    event: CalendarEvent
    date: Date
}

export const CalendarEventComponent = (props: CalendarEventComponent) => {
    //const iconClass = classnames(props.event.icon, "mr-1")
    const type = props.event.resource && props.event.resource.object_type
    const markClass = classnames("mark mr-1", type && type.toLowerCase() || "")
    const url = props.event.uri || "#"
    const showDate = !(props.date && props.event.start && sameDay(props.date, props.event.start))
    return <div className="date-separator text-center">
        {showDate && props.event.start &&
            <div className="columns">
            </div>
        }
        <Link className="calendar-event-component d-flex" to={url}>
            <div className="left d-flex">
                <div className="d-flex justify-content-start">
                    {
                        props.event.allDay
                        && <div className="all-day">{translate("calendar.all_day")}
                        </div>             
                    }
                </div>
            </div>

        <div  id="outerborder"  >
            <table  id="datetable">
                 <tr className="trfirst">
                     <td>
                     <div className="df description medium-small-text ">From:{moment(props.event.start).format(DateFormat.day)}
                     </div>                                                                                                                  
                     <div className="bw description medium-small-text ">  </div>
                     <div className="ts description medium-small-text ">{moment(props.event.start).format(DateFormat.time)}</div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                     </td>
                     <td>            
                     <div className="ds description medium-small-text">To:{moment(props.event.end).format(DateFormat.day)}</div>
                     <div className="bw2 description medium-small-text ">  </div>
                     <div className="te description medium-small-text ">{moment(props.event.end).format(DateFormat.time)}</div>   
                     </td>
                 </tr>
            </table>

            <table   id="titletable" >
                <div className="title">              
                     <tr className="trsecond">
                         <td>
                         <div  id="mic"  className={markClass}> </div>
                         </td>
                     <td>
                       
                     <div  id="titlemic"  >
                     {truncate(props.event.title, 30)}
                     </div>
                     </td>
                     </tr>     
                </div>
                <div className="description medium-small-text">{truncate(props.event.description, 90)}</div>
            </table>
        </div>
        </Link>
    </div>
}