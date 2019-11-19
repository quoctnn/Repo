
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import classnames from "classnames"
import "./CalendarModule.scss"
import 'react-big-calendar/lib/sass/styles'
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent'
import { translate } from '../../localization/AutoIntlProvider'
import { connect } from 'react-redux'
import { ReduxState } from '../../redux'
import SimpleModule from '../SimpleModule'
import { CommonModuleProps } from '../Module'
import { CalendarMenuData } from './CalendarMenu'
import { Calendar, momentLocalizer, View, NavigateAction } from 'react-big-calendar';
import * as moment from 'moment'
import {ApiClient} from '../../network/ApiClient';
import { CalendarItem, Task, Event } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarEventComponent } from './CalendarEventComponent';
const localizer = momentLocalizer(moment)
const timezone = moment.tz.guess();
export enum CalendarEventType{
    CalendarItem = "CalendarItem",
    Task = "Task",
    Event = "Event",
}
type CalendarObject = {object_type:CalendarEventType}
export const createEvent = (data:(CalendarItem | Event | Task) & CalendarObject ):CalendarEvent => {
    switch (data.object_type) {
        case "Event":{
            const event = data as Event
            return {icon:"fas fa-calendar",
                    start:moment(event.start).tz(timezone).toDate(),
                    end:moment(event.end).tz(timezone).toDate(),
                    title:event.name,
                    description: IntraSocialUtilities.htmlToText(data.description),
                    resource:data,
                    uri:event.uri,
                    hexColor:"FB0E7A",
                    }
        }
        case "Task":{
            const task = data as Task
            return {icon:"fas fa-tasks",
                    start:moment(task.due_date).tz(timezone).startOf('day').toDate(),
                    end:moment(task.due_date).tz(timezone).startOf('day').toDate(),
                    allDay:true,
                    title:task.title,
                    description:IntraSocialUtilities.htmlToText(data.description),
                    resource:data,
                    uri:task.uri,
                    hexColor:"4E13F5",
                }
        }
        case "CalendarItem":{
            const item = data as CalendarItem
            return {icon:"fas fa-calendar-day",
                    allDay:item.all_day,
                    start:moment(item.start).tz(timezone).toDate(),
                    end:moment(item.end).tz(timezone).toDate(),
                    title:item.title,
                    description:item.description,
                    resource:data,
                    uri:item.uri,
                    hexColor:"04A451",
                    }
        }
        default:return null
    }
}
export const filterCalendarEvents = (date:Date, events:CalendarEvent[]) => {
    if(!events || events.length == 0)
        return events
    const day = moment(date).startOf('day')
    const filtered =  events.filter(event => {
            const s = event.start && moment(event.start)
            const e = event.end && moment(event.end)
            return (s && s.isSame(day, "day")) ||
                    (e && e.isSame(day, "day") && day.diff(e, "seconds") >= 60) ||
                    (s && e && day > s && day < e )
    }).sort((a, b) => {
        const allDay = -Number.MAX_VALUE
        const a1 = a.allDay ? allDay : (a.start || a.end || new Date()).getTime()
        const b1 = b.allDay ? allDay : (b.start || b.end || new Date()).getTime()
        const val = a1 - b1
        return val
    })
    return filtered
}


type DateHeaderProps = {
    date: Date;
    drilldownView:View
    isOffRange:boolean
    label:string
    onDrillDown:(e) => void
    events?:CalendarItem[]
}
export type CalendarEvent = {
    allDay?: boolean
    title: string
    start?: Date
    end?: Date
    resource?: CalendarObject
    description?:string
    icon:string
    uri:string
    hexColor?:string
}
class DateHeader extends React.Component<DateHeaderProps, {}>{
    render() {
        const cn = classnames("calendar-date-header")
        const hasEvents = this.props.events && this.props.events.length > 0
        return <div onClick={this.props.onDrillDown} className={cn}>
                    <div className="content">{this.props.label}</div>
                    {hasEvents && <div className="event-indicator"></div>}
                </div>
    }
}
type DefaultProps = {
}
type OwnProps = {
    breakpoint: ResponsiveBreakpoint
    isMember?: boolean
} & CommonModuleProps & DefaultProps
type State = {
    isLoading: boolean
    menuData: CalendarMenuData
    events:CalendarEvent[]
    date:Date
}
type ReduxStateProps = {
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class CalendarModule extends React.Component<Props, State> {
    tempMenuData: CalendarMenuData = null
    static defaultProps: CommonModuleProps & DefaultProps = {
        pageSize: 15,
    }
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            menuData: {
            },
            events:[],
            date:moment().toDate()
        }
    }
    componentDidMount = () => {
        this.setState(() => {
            return {isLoading:true, events:[]}
        }, this.loadMonthData)
    }
    loadMonthData = () => {
        const date = moment(this.state.date)
        const start = date.startOf('month').toDate()
        const end = date.endOf('month').toDate()
        ApiClient.getCalendarItems(start, end, (data, status, error) => {
            const d = (data || []).map(createEvent)
            this.setState(() => {
                return {isLoading:false, events:d}
            })
        })
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
    }
    componentDidUpdate = (prevProps: Props) => {
        if (prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading) {
            this.setState({ isLoading: false })
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData
    }
    menuDataUpdated = (data: CalendarMenuData) => {
        this.tempMenuData = data
    }

    onCalendarNavigate = (newDate: Date, view: View, action: NavigateAction) => {
        if(view == "month" && (action == "NEXT" || action == "PREV"))
        {
            this.setState(() => {
                return {date:newDate, isLoading:true, events:[]}
            }, this.loadMonthData)
        }
        else { // day clicked
            const selectedMonth = moment( newDate ).month()
            const currentSelectedMonth = moment( this.state.date ).month()
            if(selectedMonth != currentSelectedMonth)
            {
                this.setState(() => {
                    return {date:newDate, isLoading:true, events:[]}
                }, this.loadMonthData)
            }
            else {
                this.setState(() => {
                    return {date:newDate}
                })
            }
        }
    }
    renderContent = () => {

        const components = {
            toolbar: (props) => <CalendarToolbar {...props} />,
            month:{
                dateHeader:(props:DateHeaderProps & any) => {
                    const date = props.date
                    const events = this.state.isLoading ? [] : filterCalendarEvents(date, this.state.events)
                    return <DateHeader {...props} events={events} />
                },
                //event:DateEvent
            }
        }
        const events = this.state.isLoading ? [] : filterCalendarEvents(this.state.date, this.state.events)
        return <div>
                <Calendar
                    date={this.state.date}
                    localizer={localizer}
                    startAccessor="start"
                    endAccessor="end"
                    components={components}
                    views={["month"]}
                    events={[]}
                    onNavigate={this.onCalendarNavigate}
                    />
                    <div className="title-text">{translate("calendar.events")}</div>
                    <div className="event-list">
                        {events.length > 0 && events.map((ce,i) => {
                            return <CalendarEventComponent key={ce.uri + "_" + i} event={ce} date={this.state.date}/>
                        })
                        || <div className="">{translate("calendar.no_events")}</div>
                        }
                    </div>
        </div>
    }
    onMenuToggle = (visible: boolean) => {
        const newState: Partial<State> = {}
        if (!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    renderModalContent = () => {
        return <CalendarModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render() {
        const { history, match, location, staticContext, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, ...rest } = this.props
        const { breakpoint, className } = this.props
        const cn = classnames("calendar-module", className)
        const menu = undefined //<CalendarMenu data={this.state.menuData} onUpdate={this.menuDataUpdated} />
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
            showHeader={false}
            renderModalContent={renderModalContent}
            className={cn}
            headerClick={this.headerClick}
            breakpoint={breakpoint}
            isLoading={this.state.isLoading}
            onMenuToggle={this.onMenuToggle}
            menu={menu}>
            {this.renderContent()}
        </SimpleModule>)
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch: ReduxState, ownProps: OwnProps): ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CalendarModule))