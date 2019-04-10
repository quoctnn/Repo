import * as React from "react";
import { withRouter} from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { UserProfile, Notification } from '../../types/intrasocial_types2';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined } from "../../utilities/Utilities";
import LoadingSpinner from "./LoadingSpinner";
import { notificationsReducerPageSize } from "../../reducers/notifications";
import * as Actions from "../../actions/Actions"
import { List } from "./List";
import NotificationItem from "./NotificationItem";
import { ProfileManager } from "../../managers/ProfileManager";
import classNames = require("classnames");
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
type DictionaryWithNumberString = {[id:number]:string}
interface State
{
    allUserAvatars:DictionaryWithNumberString
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class NotificationsList extends React.PureComponent<Props, State> {

    constructor(props) {
        super(props)
        this.state = {
            allUserAvatars:{}
        }
    }
    componentDidMount = () => {

        this.loadUserAvatars(this.props)
    }
    loadUserAvatars = (props:Props) => 
    {
        let notifications = props.items
        const sort = (a:number,b:number) => b - a
        const prevActors = Object.keys( this.state.allUserAvatars ).map(s => parseInt(s)).sort(sort)
        const allActors = notifications.map(n => n.actors).reduce((i, a) => i.concat(a), []).distinct().sort(sort)
        if (!prevActors.isEqual(allActors))
        {
            ProfileManager.ensureProfilesExists(allActors, () => {
                var avs:DictionaryWithNumberString = {}
                ProfileManager.getProfiles(allActors).forEach(p => {
                    avs[p.id] = p.avatar_thumbnail || p.avatar
                })
                this.setState({
                    allUserAvatars: avs,
                });
            })
        }
    }
    componentWillReceiveProps = (newProps:Props) => {
        this.loadUserAvatars(newProps)
    }
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
    getAvatars = (avatars:number[]) => {
        return avatars.map(id =>  this.state.allUserAvatars[id]).filter(i => !nullOrUndefined(i))
    }
    onItemPress = (event:any, id:string) => {
        event.preventDefault()
        const notification = this.props.items.find(i => i.serialization_id == id)
        if(notification)
        {

        }
    }

    render = () =>
    {
        let notifications = this.props.items
        return(
            <div id="notifications-list">
                <List onScroll={this.onScroll} className="group-list vertical-scroll">
                    {notifications.map((n, index) => 
                    {
                        let itemClass = classNames("notification-item", {
                            "seen": n.is_read,
                            "completed": n.extra == 'completed',
                            "to-verify": n.extra == 'to-verify',
                            "not-applicable": n.extra == 'not-applicable',
                            "progress": n.extra == 'progress',
                            "clickable": n.absolute_url != null,
                        })
                        return (<NotificationItem className={itemClass} id={n.serialization_id} onItemClick={this.onItemPress} text={n.display_text} date={n.created_at} avatars={this.getAvatars(n.actors)} key={n.serialization_id} />)
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