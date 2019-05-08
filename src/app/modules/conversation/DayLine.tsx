import * as React from "react";
import { stringToDate } from '../../utilities/Utilities';

type Props = {
    date:string
}
export class DayLine extends React.PureComponent<Props,{}> {
    render() {
        let createdAt = stringToDate(this.props.date)
        let time;
        let today = stringToDate()

        if (createdAt.isSame(today, 'd')) {
            time = "Today"
        } else {
            time = createdAt.format('LL')
        }
        return (
            <div className="date day-line">{time}</div>
        )
    }
}
