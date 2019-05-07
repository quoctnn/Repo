import * as React from 'react'
import classnames from "classnames"
import "./TimesheetListItem.scss"
import { Timesheet } from '../../types/intrasocial_types';
import { stringToDateFormat, DateFormat, userFullName } from '../../utilities/Utilities';
import { Link } from 'react-router-dom';
import { translate } from '../../localization/AutoIntlProvider';

type OwnProps = {
    timesheet:Timesheet
    showTaskTitle:boolean
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class TimesheetListItem extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.timesheet != this.props.timesheet
        return ret
    }
    render()
    {
        const {timesheet, className, children, showTaskTitle, ...rest} = this.props
        const cl = classnames("timesheet-list-item", className)
        const name = userFullName(timesheet.user)
        const date = stringToDateFormat(timesheet.date, DateFormat.day)
        const time = (!!timesheet.hours ? ` ${timesheet.hours}${translate("date.format.hours")}` : "") + (!!timesheet.minutes ? ` ${timesheet.minutes}${translate("date.format.minutes")}` : "")
        return (<Link to={timesheet.uri} {...rest} className={cl}>
                    <div className="d-flex justify-content-around">
                        <div className="d-flex flex-column align-items-center datetime">
                            <div className="date">{date}</div>
                            <div className="time">{time}</div>
                        </div>
                        <div className="d-flex flex-column details">
                            <div className="user">{name}</div>
                            { this.props.showTaskTitle &&
                                <div className="task-info"><b>{translate("common.task") + ":"}</b> &nbsp;{timesheet.task_title}</div>
                            }
                        </div>
                    </div>
                </Link>)
    }
}