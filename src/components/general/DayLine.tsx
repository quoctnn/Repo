import * as React from "react";
import * as moment from "moment-timezone";
require("./DayLine.scss");

let timezone = moment.tz.guess()
export interface Props {
    date:string,
}
export class DayLine extends React.PureComponent<Props,{}> {
    render() {
        let createdAt = moment.utc(this.props.date).tz(timezone)
        let time;
        let today = moment().tz(timezone)

        if (createdAt.isSame(today, 'd')) {
            time = "Today"
        } else {
            time = createdAt.format('LL')
        }
        return (
            <li className="date day-line">{time}</li>
        )
    }
}
