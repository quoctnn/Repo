import * as React from "react";
import { withRouter} from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { UserProfile, Notification } from '../../types/intrasocial_types';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined } from "../../utilities/Utilities";
import LoadingSpinner from "./LoadingSpinner";
import { notificationsReducerPageSize } from "../../reducers/notifications";
import * as Actions from "../../actions/Actions" 
import { List } from "./List";
import { setNotificationPageNotFetching } from '../../actions/Actions';
import NotificationItem from "./NotificationItem";
require("./NotificationsList.scss");

export interface OwnProps
{
}
interface RouteProps
{
    history:any
    location: any
    match:any
}
interface ReduxStateProps
{
    total:number
    isFetching:boolean
    items:Notification[]
    offset:number
    error:string
    authenticatedProfile:UserProfile
    last_fetched:number
    pagingDirty:boolean
    signedIn:boolean
}
interface ReduxDispatchProps
{
    requestNextNotificationPage?:(page:number) => void
    setNotificationPageNotFetching?:() => void
}
interface State
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class NotificationsList extends React.PureComponent<Props, State> {

    componentWillMount = () => 
    {
        this.loadFirstData(true)
    }
    componentDidUpdate = (prevProps:Props) => 
    {
        if (this.props.signedIn && (this.props.pagingDirty && !prevProps.pagingDirty || !prevProps.signedIn))
        {
            console.log("componentDidUpdate", this.props.signedIn, this.props.pagingDirty)
            this.loadFirstData(true)
        }
    }
    loadFirstData = (ignoreError = false) => 
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if(this.props.isFetching || hasError)
        {
            if(this.props.isFetching)
                this.props.setNotificationPageNotFetching() 
            return
        }
        let pageSize = notificationsReducerPageSize
        if(this.props.pagingDirty || this.props.total == 0 || this.props.offset == 0 || (!this.props.last_fetched && this.props.offset <= pageSize))
            this.props.requestNextNotificationPage(0) 
    }
    loadNextPageData = () =>
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
            this.props.requestNextNotificationPage(this.props.offset)
    }
    renderLoading = () => 
    {
        if (this.props.isFetching) {
            return (<LoadingSpinner key="loading"/>)
        }
    }
    onScroll = (event:React.UIEvent<HTMLUListElement>) =>
    {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.loadNextPageData()
        }
    }
    render = () => 
    {
        let notifications = this.props.items
        return(
            <div id="notifications-list">
                <List onScroll={this.onScroll} className="group-list vertical-scroll">
                    {notifications.map((n, index) => {
                        return (<NotificationItem text={n.display_text} date={n.created_at} avatarProfiles={n.actors.map(i => i.id)} key={n.serialization_id} />)
                    }) }
                    {this.renderLoading()}
                </List>
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    const pagination = state.notifications.pagination
    const allItems = state.notifications.pagination.items
    const isFetching = pagination.fetching
    const items:Notification[] = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const offset = pagination.position
    const error = pagination.error
    const last_fetched = pagination.last_fetch
    const pagingDirty = pagination.dirty
    return {
        isFetching,
        items,
        total,
        offset,
        error,
        authenticatedProfile:state.auth.profile,
        last_fetched,
        pagingDirty,
        signedIn:state.auth.signedIn,
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        requestNextNotificationPage:(page:number) => {
            dispatch(Actions.requestNextNotificationPage(page))
        },
        setNotificationPageNotFetching:() => {
            dispatch(Actions.setNotificationPageNotFetching())
        },
    }
}
export default withRouter<RouteProps>(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NotificationsList));