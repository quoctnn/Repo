
import * as React from "react";
import Moment from "react-moment";
import * as moment from 'moment-timezone';
import { DateFormat } from '../../utilities/Utilities';
let timezone = moment.tz.guess();
export const TimeComponent = (props:{date:string, placeholder?:React.ReactNode}) => {
    if (!props.date) {
        return <>{props.placeholder || null}</>
    }
    const [fromNow, setFromNow] = React.useState(true)
    const toggleFromNow = (e:React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setFromNow(!fromNow)
    }
    // Add one minute to the current date to give some room for time inaccuracy
    let data = moment.utc(props.date).tz(timezone).toDate();
    let now = moment.utc().tz(timezone).toDate()
    const format = fromNow ? undefined : DateFormat.date
    if (data <= now) {
        return <span onClick={toggleFromNow}><Moment format={format} interval={60000} fromNow={fromNow} date={data} /></span>
    } else {
        return <span onClick={toggleFromNow}><Moment format={format} interval={60000} fromNow={fromNow} date={now} /></span>
    }
}