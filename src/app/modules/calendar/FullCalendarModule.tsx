
import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import classnames from "classnames"
import "./FullCalendarModule.scss"
import 'react-big-calendar/lib/sass/styles'
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent'
import { connect } from 'react-redux'
import { ReduxState } from '../../redux'
import SimpleModule from '../SimpleModule'
import { CommonModuleProps } from '../Module'
import { CalendarMenuData } from './CalendarMenu'
import { Calendar, momentLocalizer, View, NavigateAction, stringOrDate, EventProps, CalendarProps } from 'react-big-calendar';
import * as moment from 'moment'
import ApiClient from '../../network/ApiClient';
import { createEvent, CalendarEvent, filterCalendarEvents } from './CalendarModule';
import { CalendarToolbar } from './CalendarToolbar';
import { DateFormat } from '../../utilities/Utilities';
import { CalendarEventComponent } from './CalendarEventComponent';
import { translate } from '../../localization/AutoIntlProvider';
type AgendaListItem = {
    date:Date,
    items:CalendarEvent[]
}
const localizer = momentLocalizer(moment)
type AgendaDefaultProps = {
    length:number
}
type AgendaProps = AgendaDefaultProps & CalendarProps
class AgendaComponent extends React.Component<AgendaProps, {}>{
    static defaultProps:AgendaDefaultProps = {
        length:30
    }
    static title = (start:Date, { length = AgendaComponent.defaultProps.length, localizer }) => {
        let end = moment(start).add(length, "days").toDate()
        return localizer.format({ start, end }, 'agendaHeaderFormat')
    }
    static range = (start:Date, { length = AgendaComponent.defaultProps.length }) => {
        let end = moment(start).add(length, "days").toDate()
        return { start, end }
    }
      
    static navigate = (date:Date, action:NavigateAction, { length = AgendaComponent.defaultProps.length }) => {
        switch (action) {
          case "PREV":
            return moment(date).add(-length, "days").toDate()
      
          case "NEXT":
            return moment(date).add(length, "days").toDate()
      
          default:
            return date
        }
    }
    render() {
        let { length, date, localizer } = this.props
        const start = moment(date)
        let end = moment(date).add(length, "days")
        const arr:Date[] = []
        while(start.diff(end, "days") < 1){
            arr.push(start.toDate());
            start.add(1, "days")
        }
        const events = this.props.events as CalendarEvent[]
        const data:AgendaListItem[] = arr.map(d => {
            return {items:filterCalendarEvents(d, events), date:d}
        }).filter(li => li.items.length > 0 )
        const cn = classnames("agenda-component")
        return <div className={cn}>
                    {data.map(d => {
                        return <div key={"agenda_" + d.date.getTime()} className="agenda-day">
                                <div className="title">
                                    {moment(d.date).format(DateFormat.day)}
                                </div>
                                {d.items.length > 0 && d.items.map((ce, i) => {
                                    return <CalendarEventComponent key={ce.uri + "_" + i} event={ce} date={d.date}/>
                                }) ||
                                    <div className="">{translate("calendar.no_events")}</div>
                                }
                                
                        </div>
                    })}
                </div>
    }
}
const CalendarItemComponent = (props:EventProps<CalendarEvent>) => {
    const getClassName = () => {
        return classnames("calendar-event-item", props.event.resource.object_type.toLowerCase())
    }
    return <Link className={getClassName()} to={props.event.uri}>{props.title}</Link>
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
class FullCalendarModule extends React.Component<Props, State> {
    tempMenuData: CalendarMenuData = null
    view:View = "month"
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
        console.log("cal navigated", newDate, view, action)
        if(view == "month" && (action == "NEXT" || action == "PREV"))
        {
            this.setState(() => {
                return {date:newDate, isLoading:true, events:[]}
            }, this.loadMonthData)
        }
        else { // day clicked?
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
    eventPropGetter = (event:CalendarEvent, start:stringOrDate, end:stringOrDate, isSelected:boolean) => {
        if(this.view == "agenda")
            return {}
        return {
            className:classnames("calendar-event", event.resource.object_type.toLowerCase())
        };
    }
    renderContent = () => {

        const components = {
            toolbar: (props) => <CalendarToolbar {...props} fullView={true} />,
            event: CalendarItemComponent,

        }
        const events = this.state.events
        const agenda:any = AgendaComponent
        return <div>
                <Calendar
                    date={this.state.date}
                    localizer={localizer}
                    startAccessor="start"
                    endAccessor="end"
                    components={components}
                    views={{month:true, day:true, week:true, agenda:agenda}}
                    events={events}
                    onView={(e) => this.view = e}
                    onNavigate={this.onCalendarNavigate}
                    eventPropGetter={this.eventPropGetter}
                    />
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
        return <FullCalendarModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render() {
        const { history, match, location, staticContext, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, ...rest } = this.props
        const { breakpoint, className } = this.props
        const cn = classnames("full-calendar-module", className)
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
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FullCalendarModule))