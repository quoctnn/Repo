import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ActivityModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { RecentActivity } from '../../types/intrasocial_types';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import ActivityItem  from './ActivityItem';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { eventStreamNotificationPrefix, EventStreamMessageType } from '../../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
}
type State = {
    isLoading:boolean
}
type Props = OwnProps & RouteComponentProps<any>
class ActivityModule extends React.Component<Props, State> {
    activityId = 0;
    activityListInput = React.createRef<ListComponent<RecentActivity>>()
    observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
        }
    }
    shouldReloadList = (prevProps:Props, prevState:State) => {
        return true;
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    componentDidMount = () => {
        const observer1 = NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.ACTIVITY_NEW, this.newActivityReceived)
        this.observers.push(observer1)
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null
        this.activityListInput = null
    }
    newActivityReceived = (...args:any[]) => {
        const activity = args[0] as RecentActivity;
        if (activity && this.activityListInput.current) 
            this.activityListInput.current.safeUnshift(activity);
    }
    headerClick = (e) => {
        return 0;
    }
    getKey = (activity: RecentActivity) => {
        // There is no unique key for notifications, so we use an incrementing integer
        this.activityId += 1
        return this.activityId
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchActivity = (offset:number, completion:(items:PaginationResult<RecentActivity>) => (void)) => {
        ApiClient.getRecentActivity(15, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderActivity = (activity:RecentActivity) =>  {
        return <ActivityItem key={this.getKey(activity)} activity={activity} />
    }
    renderContent = () => {
        const {} = this.props
        return <>
            {
                <ListComponent<RecentActivity>
                    ref={this.activityListInput}
                    onLoadingStateChanged={this.feedLoadingStateChanged}
                    fetchData={this.fetchActivity}
                    renderItem={this.renderActivity} className="activity-module-list" />}
            </>
    }
    render()
    {
        const {history, match, location, staticContext,...rest} = this.props
        const {breakpoint } = this.props
        return (<SimpleModule {...rest}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    headerTitle={translate("common.activity")}>
                    {this.renderContent()}
                </SimpleModule>
                )
    }
}
export default withRouter(ActivityModule)