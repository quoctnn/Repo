import * as React from 'react';
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions" 
import { RootState } from '../../reducers';
import { UserProfile } from '../../reducers/profileStore';
import { UploadedFile } from '../../reducers/conversations';
import { nullOrUndefined } from '../../utilities/Utilities';
import { statusReducerPageSize, Status, StatusContextKeys } from '../../reducers/statuses';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { List } from '../../components/general/List';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import StatusComponent from '../../components/general/status/StatusComponent';
import { ProfileManager } from '../../main/managers/ProfileManager';
import { StatusManager } from '../../main/managers/StatusManager';
import { getDefaultCachePage } from '../../reducers/createPaginator';
import { QueueUtilities } from '../../utilities/QueueUtilities';
require("./NewsFeed.scss");
export interface OwnProps 
{
}
interface ReduxStateProps 
{
    total:number,
    isFetching:boolean,
    items:Status[],
    offset:number,
    error:string,
    profile:UserProfile,
    last_fetched:number,
}
interface ReduxDispatchProps 
{
    requestNextStatusPage:(offset:number) => void
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class NewsFeed extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
        this.state = {
            isTyping:{},
        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
        this.onScroll = this.onScroll.bind(this) 
        this.onStatusEdit = this.onStatusEdit.bind(this)
        this.onCommentEdit = this.onCommentEdit.bind(this)
        this.onCommentDelete = this.onCommentDelete.bind(this)
        this.onStatusDelete = this.onStatusDelete.bind(this)
        this.onCommentSubmit = this.onCommentSubmit.bind(this)
    }
    componentWillMount()
    {
        this.loadFirstData(true)
    }
    onScroll(event:React.UIEvent<HTMLUListElement>)
    {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.loadNextPageData()
        }
    }
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if(this.props.isFetching || hasError)
        {
            return
        }
        let pageSize = statusReducerPageSize
        if(this.props.total == 0 || this.props.offset == 0 || (!this.props.last_fetched && this.props.offset <= pageSize))
            this.props.requestNextStatusPage(this.props.offset) 
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
            this.props.requestNextStatusPage(this.props.offset)
    }
    renderLoading() {
        if (this.props.isFetching) {
            return (<LoadingSpinner key="loading"/>)
        }
    }
    onStatusEdit(status:Status, files:UploadedFile[])
    {
        console.log("onStatusEdit", status, files)
    }
    onCommentEdit(comment:Status, files:UploadedFile[])
    {
        console.log("onCommentEdit", comment, files)
    }
    onCommentDelete(comment:Status)
    {
        console.log("onCommentDelete", comment)
    }
    onStatusDelete(removeId:number)
    {
        console.log("onStatusDelete", removeId)
    }
    onCommentSubmit(comment:Status, files:UploadedFile[])
    {
        console.log("onCommentSubmit", comment, files)

        // Get the status index where the comment is child
        let parentStatusIndex = this.props.items.findIndex(o => o.id == comment.parent)

        let previewComment = this.getStatusPreview(comment, files)
        console.log(previewComment)
        StatusManager.sendStatus(previewComment)
    }
    getStatusPreview(status:Status, files:UploadedFile[]) {
        let d = Date.now()
        status = Object.assign({}, status)
        status.id = d
        status.uid = d
        status.owner = ProfileManager.getAuthenticatedUser()
        status.reactions = {}
        status.comments_count = 0
        status.children = []
        status.link = status.link
        status.files = files
        status.pending = true
        return status
    }
    render() {
        let authUser = ProfileManager.getAuthenticatedUser()
        
        return(
            <FullPageComponent> 
                <List enableAnimation={false} onScroll={this.onScroll} className="status-list full-height col-sm group-list vertical-scroll">
                    {this.props.items.map((s) => {
                        return <StatusComponent 
                                canMention={true}
                                canComment={true}
                                canUpload={true}
                                canReact={true}
                                isOwner={authUser.id == s.owner.id}
                                onStatusEdit={this.onStatusEdit}
                                onCommentEdit={this.onCommentEdit}
                                onCommentDelete={this.onCommentDelete}
                                onStatusDelete={this.onStatusDelete}
                                onCommentSubmit={this.onCommentSubmit}
                                addLinkToContext={true}
                                key={s.id} 
                                status={s} 
                                bottomOptionsEnabled={true} />
                    }) }
                    {this.renderLoading()}
                </List>
            </FullPageComponent> 
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    const pagination = state.statuses.feed[StatusContextKeys.NEWSFEED] || getDefaultCachePage()
    const allItems = state.statuses.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination).cloneArray()
    const populateList = (statusList:Status[]) => 
    {
        statusList.forEach(c => 
        {
            if(c.children_ids && c.children_ids.length > 0)
            {
                c.children = PaginationUtilities.getResults(allItems, c.children_ids)
                populateList(c.children)
            }
        } )
    }
    populateList(items)
    const total = pagination.totalCount
    const offset = items.length
    const queuedStatuses = QueueUtilities.getQueuedStatusesForFeed(StatusContextKeys.NEWSFEED, state.queue.statusMessages)
    const error = pagination.error
    const last_fetched = pagination.last_fetch
    const parents:Status[] = []
    const children:Status[] = []
    queuedStatuses.forEach(s => {
        if(s.parent == null)
            parents.push(s)
        else 
            children.push(s)
    })
    const statuses = parents.concat(items).map(i => {i.children = i.children.map(j => j); return i;})
    children.reverse().forEach(child => {
        let status = statuses.find(p => p.id == child.parent)
        if(status)
        {
            let chldrn = status.children
            chldrn.unshift(child)
            status.children = chldrn
        }
    })
    return {
        isFetching,
        items:statuses,
        total,
        offset,
        error,
        profile:state.profile,
        last_fetched
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        requestNextStatusPage:(offset:number) => {
            dispatch(Actions.requestNextStatusPage(StatusContextKeys.NEWSFEED, offset))
        }
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsFeed);