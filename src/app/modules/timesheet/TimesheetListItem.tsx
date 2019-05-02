import * as React from 'react'
import classnames from "classnames"
import "./TimesheetListItem.scss"
import { Event, IntraSocialType, Timesheet } from '../../types/intrasocial_types';
import { eventCover, stringToDate, DateFormat, userFullName } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';
import Routes from '../../utilities/Routes';
import { Link } from 'react-router-dom';
import { translate } from '../../localization/AutoIntlProvider';

type OwnProps = {
    timesheet:Timesheet
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
        const {timesheet, className, children, ...rest} = this.props
        const cl = classnames("timesheet-list-item", className)
        const name = userFullName(timesheet.user)
        const date = stringToDate(timesheet.date, DateFormat.day)
        const time = (!!timesheet.hours ? ` ${timesheet.hours}${translate("date.format.hours")}` : "") + (!!timesheet.minutes ? ` ${timesheet.minutes}${translate("date.format.minutes")}` : "")
        return (<Link to={timesheet.uri} {...rest} className={cl}>
                    <div className="d-flex justify-content-around">
                        <div className="d-flex flex-column align-items-center datetime">
                            <div className="date">{date}</div>
                            <div className="time">{time}</div>
                        </div>
                        <div className="d-flex flex-column details">
                            <div className="user">{name}</div>
                            <div className="task-info"><b>{translate("common.task") + ":"}</b> &nbsp;{timesheet.task}</div>
                        </div>
                    </div>
                </Link>)
    }
}