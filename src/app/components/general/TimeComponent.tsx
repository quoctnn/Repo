
import * as React from "react";
import Moment from "react-moment";
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess();
export const TimeComponent = (props:{date:string, placeholder?:React.ReactNode}) => {
    if (!props.date) {
        return <>{props.placeholder || null}</>
    }
    // Add one minute to the current date to give some room for time inaccuracy
    let data = moment.utc(props.date).tz(timezone).toDate();
    let now = moment.utc().tz(timezone).toDate()
    if (data <= now) {
        return <Moment interval={60000} fromNow={true} date={data} />
    } else {
        return <Moment interval={60000} fromNow={true} date={now} />
    }
}