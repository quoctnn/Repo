import * as React from 'react';
import classnames = require("classnames");
import { CalendarEvent } from "./CalendarModule";
import { Link } from "react-router-dom";
import * as moment from 'moment'
import { translate } from '../../localization/AutoIntlProvider';
import "./CalendarEventComponent.scss"

const getStartTime = (date:Date, start:Date) => {
    const d = moment(date), s = moment(start)
    return (d.isSame(start, "day") ? s : s.startOf('day')).format("HH:mm")
}
const getEndTime = (date:Date, end:Date) => {
    const d = moment(date), e = moment(end)
    return (d.isSame(e, "day") ? e : e.endOf('day')).format("HH:mm")
}
export type CalendarEventComponent = {
    event:CalendarEvent
    date:Date
}
export const CalendarEventComponent = (props:CalendarEventComponent) => {
    //const iconClass = classnames(props.event.icon, "mr-1")
    const type = props.event.resource && props.event.resource.object_type
    const markClass = classnames("mark mr-1", type && type.toLowerCase() || "")
    const url = props.event.uri || "#"
    return <Link className="calendar-event-component d-flex" to={url}>
                <div className="left d-flex">
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        {
                            props.event.allDay 
                            && <div className="all-day">{translate("calendar.all_day")}</div>
                            || <>
                                   {props.event.start && <div className="date-start">{getStartTime(props.date, props.event.start)}</div>} 
                                   {props.event.end && <div className="date-end">{getEndTime(props.date, props.event.end)}</div>}
                                </>
                        }
                    </div>
                </div>
                <div className="right d-flex flex-column justify-content-center">
                    <div className="title">
                        <div className={markClass}></div>
                        {props.event.title}</div>
                    <div className="description medium-small-text">{props.event.description}</div>
                </div>
            </Link>
}