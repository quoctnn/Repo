import * as React from 'react';
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions" 
import { RootState } from '../../reducers';
import { nullOrUndefined } from '../../utilities/Utilities';
import { statusReducerPageSize, StatusContextKeys } from '../../reducers/statuses';
import { PaginationUtilities, NestedPageItem } from '../../utilities/PaginationUtilities';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { List } from '../../components/general/List';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import StatusComponent from '../../components/general/status/StatusComponent';
import { StatusManager } from '../../managers/StatusManager';
import { getDefaultCachePage } from '../../reducers/createPaginator';
import { QueueUtilities } from '../../utilities/QueueUtilities';
import * as Immutable from 'immutable';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { Status, UserProfile, UploadedFile } from '../../types/intrasocial_types';
import StatusFormContainer from '../../components/general/status/StatusFormContainer';
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
require("./NewsFeed.scss");
export interface OwnProps 
{
}
interface ReduxStateProps 
{
    total:number,
    isFetching:boolean,
    items:FeedListItem[],
    offset:number,
    error:string,
    authenticatedProfile:UserProfile,
    last_fetched:number,
}
class StatusComposer
{
    pageItem:NestedPageItem
    constructor(pageItem:NestedPageItem )
    {
        this.pageItem = pageItem
    }
}
class StatusCommentLoader
{
    statusId:number
    currentCommentsCount:number 
    totalCommentsCount:number 
    constructor(statusId:number, currentCommentsCount:number, totalCommentsCount:number)
    {
        this.statusId = statusId
        this.currentCommentsCount = currentCommentsCount
        this.totalCommentsCount = totalCommentsCount
    }
}
type FeedListItem = NestedPageItem | StatusComposer | StatusCommentLoader
type StatusDict = {[id:number]:Status}
interface ReduxDispatchProps 
{
    requestNextStatusPage:(offset:number) => void
    insertStatuses:(comments:Status[]) => void
}
interface State 
{
    activeCommentLoaders:{[index:number]:StatusCommentLoader}
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class NewsFeed extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            activeCommentLoaders:{},
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

        let previewComment = this.getStatusPreview(comment, files)
        console.log(previewComment)
        StatusManager.sendStatus(previewComment)
    }
    getStatusPreview(status:Status, files:UploadedFile[]) {
        let d = Date.now()
        status = Object.assign({}, status)
        status.id = d
        status.uid = d
        status.owner = AuthenticationManager.getAuthenticatedUser()
        status.reactions = {}
        status.comments_count = 0
        status.children = []
        status.link = status.link
        status.files = files
        status.pending = true
        return status
    }
    renderStatus = (authUser:UserProfile, item:NestedPageItem, isLast:boolean, index:number) => 
    {
        const cn = isLast ? "last" : undefined
        return <StatusComponent 
        canMention={true}
        canComment={true}
        canUpload={true}
        canReact={true}
        onStatusEdit={this.onStatusEdit}
        onCommentEdit={this.onCommentEdit}
        onCommentDelete={this.onCommentDelete}
        onStatusDelete={this.onStatusDelete}
        onCommentSubmit={this.onCommentSubmit}
        addLinkToContext={true}
        key={"status_" + item.id} 
        pageItem={item} 
        bottomOptionsEnabled={true} 
        authorizedUserId={authUser.id}
        className={cn} />
    }
    renderStatusComposer = (composer:StatusComposer, index:number) => {
            return (
                <StatusFormContainer
                    key={"statuscomposer_" + composer.pageItem.id}
                    canUpload={true}
                    pageItem={composer.pageItem}
                    canMention={true}
                    canComment={true}
                    onCommentSubmit={this.onCommentSubmit} 
                    className={"drop-shadow"}
                    />
            )
    }
    didLoadMoreComments = (loader:StatusCommentLoader, comments:Status[]) => 
    {
        this.props.insertStatuses(comments)
    }
    _loadComments = (loader:StatusCommentLoader) => 
    {
        const limit = 10
        const offset = loader.currentCommentsCount
        console.log("loadItems comments", "limit:" + limit, "offset:"+offset)
        ApiClient.newsfeed(limit,offset,loader.statusId, null, (data, status, error) => {
            console.log("data", data, status, error)
            if(data && data.results)
            {
                this.didLoadMoreComments(loader, data.results)
            }
        })
    }
    loadMoreComments = (loader:StatusCommentLoader) => (e:any) => 
    {
        console.log("loadMoreFromLoader", loader.statusId)
        let currentLoaders = this.state.activeCommentLoaders
        currentLoaders[loader.statusId] = loader
        this.setState({activeCommentLoaders:currentLoaders}, () => {this._loadComments(loader)})
    
    }
    renderCommentLoader =  (loader: StatusCommentLoader, index:number) => 
    {
        const isLoading = this.state.activeCommentLoaders[loader.statusId] != undefined
        return (
            <button key={"statusloader_" + loader.statusId} className="btn btn-link link-text comment-loader" onClick={this.loadMoreComments(loader)}>
                <i className="fa fa-arrow-down"/> &nbsp;
                {translate("Show previous")}
            </button>
        )
    }
    render() {
        let authUser = AuthenticationManager.getAuthenticatedUser()
        if(!authUser)
        {
            return null
        }
        const len = this.props.items.length
        return(

            <FullPageComponent> 
                    <List 
                    enableAnimation={false} 
                    onScroll={this.onScroll} 
                    className="status-list full-height col-sm group-list vertical-scroll">
                        {this.props.items.map((s, i) => {
                            const next = len > i + 1 ? this.props.items[i + 1] : undefined
                            const isCurrentLast = next instanceof StatusComposer
                            if(s instanceof StatusComposer)
                            {
                                return this.renderStatusComposer(s, i)
                            }
                            else if(s instanceof StatusCommentLoader)
                            {
                                return this.renderCommentLoader(s, i)
                            }
                            return this.renderStatus(authUser,s, isCurrentLast, i)
                        }) }
                        {this.renderLoading()}
                    </List>
            </FullPageComponent> 
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => 
{
    const pagination = state.statuses.feed[StatusContextKeys.NEWSFEED] || getDefaultCachePage()
    const allItems:StatusDict= Immutable.fromJS(state.statuses.items).toJS()
    //
    let rootItems = PaginationUtilities.getStatusPageResults(allItems, pagination.ids, false) // Root statuses

    const parents:number[] = []
    const tempChildren:Status[] = []
    const queuedDict:StatusDict = {}
    const queuedStatuses = QueueUtilities.getQueuedStatusesForFeed(StatusContextKeys.NEWSFEED, state.queue.statusMessages)
    queuedStatuses.forEach(s => {
        queuedDict[s.id] = s
        if(s.parent == null)
            parents.push(s.id)
        else 
            tempChildren.push(s)
    })
    const parentItems = PaginationUtilities.getStatusPageResults(queuedDict, parents, true)
    const allRootItems = parentItems.concat(rootItems)
    tempChildren.reverse().forEach(temp => {
        let rootItem = allRootItems.find(p => p.id == temp.parent)
        if(rootItem)
        {
            let childItems = PaginationUtilities.getStatusPageResults(queuedDict, [temp.id], true)
            let chldrn = childItems.concat(rootItem.children)
            rootItem.children = chldrn
        }
    })
    let result:FeedListItem[] = []
    allRootItems.forEach(p => {
        result.push(p)
        if(p.childrenCount != p.children.length)
            result.push(new StatusCommentLoader(p.id, p.children.length, p.childrenCount))
        p.children.reverse().forEach(c => result.push(c))
        const item:NestedPageItem = {id:p.id, isTemporary:p.isTemporary, children:[], community:p.community, childrenCount:p.childrenCount}
        result.push(new StatusComposer(item))
    })
    const items = PaginationUtilities.getStatusPageResults(allItems, pagination.ids, false) 
    const isFetching = pagination.fetching
    const total = pagination.totalCount
    const offset = items.length
    const error = pagination.error
    const last_fetched = pagination.last_fetch
    return {
        isFetching,
        items:result,
        total,
        offset,
        error,
        authenticatedProfile:state.auth.profile,
        last_fetched
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        requestNextStatusPage:(offset:number) => {
            dispatch(Actions.requestNextStatusPage(StatusContextKeys.NEWSFEED, offset))
        },
        insertStatuses:(comments:Status[]) => {
            dispatch(Actions.insertStatuses(comments))
        },
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsFeed);