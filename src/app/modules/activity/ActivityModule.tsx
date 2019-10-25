import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import "./ActivityModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { RecentActivity, ActivitySorting } from '../../types/intrasocial_types';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import ActivityItem  from './ActivityItem';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { eventStreamNotificationPrefix, EventStreamMessageType } from '../../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
import { CommonModuleProps } from '../Module';
import ActivityMenu, { ActivityMenuData } from './ActivityMenu';
import { OverflowMenuItemType, OverflowMenuItem } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { Checkbox } from '../../components/general/input/Checkbox';
import classnames from 'classnames';
import { Button } from 'reactstrap';
import { findScrollParent } from '../../utilities/Utilities';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
}
type DefaultProps = {
    sorting:ActivitySorting
    showHeader:boolean
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    isSelecting:boolean
    menuData:ActivityMenuData
    selected:number[]
}
type Props = OwnProps & DefaultProps & RouteComponentProps<any>
class ActivityModule extends React.Component<Props, State> {
    tempMenuData:ActivityMenuData = null
    activityListInput = React.createRef<ListComponent<RecentActivity>>()
    observers:EventSubscription[] = []
    static defaultProps:DefaultProps = {
        pageSize:15,
        sorting: ActivitySorting.recent,
        showHeader:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            isSelecting:false,
            menuData:{
                sorting:props.sorting
            },
            selected:[],
        }
    }
    shouldReloadList = (prevProps:Props, prevState:State) => {
        return (this.state.menuData.sorting != prevState.menuData.sorting)
    }
    contextDataChanged = (prevData:ActivityMenuData, prevProps:Props) => {
        const data = this.state.menuData
        return prevData.sorting != data.sorting
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldReloadList(prevProps, prevState) || this.contextDataChanged(prevState.menuData, prevProps))
        {
            this.activityListInput.current.reload()
        }
        if (prevProps.breakpoint != this.props.breakpoint &&
           this.props.breakpoint < ResponsiveBreakpoint.standard &&
           this.state.isLoading)
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
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchActivity = (offset:number, completion:(items:PaginationResult<RecentActivity>) => (void)) => {
        const unseen = this.state.menuData.sorting == ActivitySorting.onlyUnseen
        ApiClient.getRecentActivity(this.props.pageSize, offset, unseen, (data, status, error) => {
            completion(data)
            // ToastManager.showRequestErrorToast(error)
        })
    }
    menuDataUpdated = (data:ActivityMenuData) => {
        this.tempMenuData = data
    }
    onMenuToggle = (visible:boolean) => {
        const newState:Partial<State> = {}
        newState.menuVisible = visible
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    renderActivity = (activity:RecentActivity, index:number) =>  {
        return <ActivityItem key={activity.id + "_" + index}  activity={activity} />
    }
    toggleSorting = (sorting: ActivitySorting) => (e) => {
        const md = {sorting: sorting}
        this.setState({menuData:md})
    }
    handleSelectionChange = (id:number, selected:boolean) => {
        const selectedItems = [...this.state.selected]
        selectedItems.toggleElement(id)
        this.setState(() => {
            return {selected:selectedItems}
        })
    }
    renderSorting = () => {
        if(this.state.menuVisible)
            return null
        const ddi: OverflowMenuItem[] = ActivitySorting.all.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.toggleSorting(s),
                title:ActivitySorting.translatedText(s),
                iconClass:ActivitySorting.icon(s),
            }
        })
        const title = ActivitySorting.translatedText(this.state.menuData.sorting)
        return <DropDownMenu triggerIcon={ActivitySorting.icon(this.state.menuData.sorting)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    getList = () => {
        return this.activityListInput && this.activityListInput.current
    }
    selectAll = () => {
        const list = this.getList()
        const items = list && list.getItems().map(i => i.id) || []
        this.setState(() => {
            return {selected:items}
        })
    }
    clearSelection = () => {
        this.setState(() => {
            return {selected:[]}
        })
    }
    headerCheckboxChange = (checked: boolean) => {
        if(checked)
            this.selectAll()
        else
            this.clearSelection()
    }
    markActivitiesAsSeen = () => {
        const selected = this.state.selected
        ApiClient.markActivitiesAsSeen(selected, (data, status, error) => {
            if(!error)
            {
                const list = this.activityListInput && this.activityListInput.current
                if(list)
                {
                    list.reload()
                }
                this.toggleSelect()
            }
        })
    }
    renderContent = () => {
        const {showLoadMore} = this.props
        return <div className="p-2">
                {this.renderOptions()}
                <ListComponent<RecentActivity>
                    ref={this.activityListInput}
                    onLoadingStateChanged={this.feedLoadingStateChanged}
                    fetchData={this.fetchActivity}
                    renderItem={this.renderActivity}
                    loadMoreOnScroll={!showLoadMore}
                    onItemSelectionChange={this.handleSelectionChange}
                    selected={this.state.selected}
                    isSelecting={this.state.isSelecting}
                    findScrollParent={true}
                    className="activity-module-list" />
            </div>
    }
    renderOptions = () => {
        const {isSelecting, selected} = this.state
        return <div className="header d-flex align-items-center">
            {isSelecting && <Checkbox checked={selected.length > 0} checkedIcon="fas fa-minus" onValueChange={this.headerCheckboxChange} />}
            <div className="flex-grow-1"></div>
            {isSelecting && selected.length > 0 &&  <Button color="light" size="xs" onClick={this.markActivitiesAsSeen}>{translate('common.mark.seen')}</Button>}
            <Button color="light" size="xs" onClick={this.toggleSelect}>{translate(isSelecting ? "Cancel" : "common.edit")}</Button>
            {this.renderSorting()}
        </div>
    }
    renderModalContent = () => {
        return <ActivityModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    toggleSelect = () => {
        const selecting = !this.state.isSelecting
        const completion = !selecting ? undefined : this.clearSelection
        this.setState((prevState:State) => {
           return {isSelecting: selecting}
        }, completion)
    }
    render()
    {
        const {history, match, location, staticContext, pageSize, showHeader, showLoadMore, showInModal, isModal, className, ...rest} = this.props
        const {breakpoint } = this.props
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        const cn = classnames("activity-module", className)
        return (<SimpleModule {...rest}
                    showHeader={!isModal}
                    showHeaderTitle={!isModal}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    renderModalContent={renderModalContent}
                    className={cn}
                    headerTitle={translate("common.activity")}>
                    {this.renderContent()}
                </SimpleModule>
                )
    }
}
export default withRouter(ActivityModule)