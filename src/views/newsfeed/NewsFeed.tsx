import * as React from 'react';
import { connect } from 'react-redux'
import { RootState } from '../../reducers';
import { nullOrUndefined } from '../../utilities/Utilities';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { List } from '../../components/general/List';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import StatusComponent, { StatusActions } from '../../components/general/status/StatusComponent';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { Status, UserProfile, UploadedFile, ContextNaturalKey } from '../../types/intrasocial_types';
import StatusFormContainer from '../../components/general/status/StatusFormContainer';
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { StatusUtilities } from '../../utilities/StatusUtilities';
import { withRouter } from 'react-router';
import * as Immutable from 'immutable';
import { ToastManager } from '../../managers/ToastManager';
require("./NewsFeed.scss");

class StatusComposer
{
    statusId:number
    communityId:number
    contextObjectId:number 
    contextNaturalKey:string
    constructor(statusId:number, communityId:number, contextObjectId:number, contextNaturalKey:string)
    {
        this.statusId = statusId
        this.communityId = communityId
        this.contextObjectId = contextObjectId
        this.contextNaturalKey = contextNaturalKey
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
type FeedListItem = Status | StatusComposer | StatusCommentLoader
type ArrayItem = 
{
    index:number 
    object:FeedListItem
}
export interface OwnProps 
{
    limit:number
}
interface RouteProps
{
    history:any
    location: any
    match:any
}
interface ReduxStateProps 
{
    authenticatedProfile:UserProfile,
}
interface ReduxDispatchProps 
{
}
interface State 
{
    activeCommentLoaders:{[index:number]:StatusCommentLoader}
    total:number
    items:FeedListItem[]
    offset:number
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class NewsFeed extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            activeCommentLoaders:{},
            total:-1,
            isLoading:false,
            isRefreshing:false,
            items:[],
            offset:0,
            hasMore:true,
        }
        this.onStatusEdit = this.onStatusEdit.bind(this)
        this.onCommentEdit = this.onCommentEdit.bind(this)
    }
    componentDidMount = () => 
    {
        this.setState({
            isLoading: true
        }, this.loadStatuses);
    }
    onScroll = (event:React.UIEvent<HTMLUListElement>) =>
    {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.handleLoadMore()
        }
    }
    flattenData = (data:Status[]) => 
    {
        var res:FeedListItem[] = []
        data.forEach(s => {
            let c = s.children || []
            s.children = []
            res.push(s)
            if(c.length > 0)
            {
                if(s.comments_count != c.length)
                {
                    res.push(new StatusCommentLoader(s.id, c.length, s.comments_count))
                }
                res = res.concat(this.flattenData(c).reverse())
            }
            if(nullOrUndefined( s.parent ))
                res.push(new StatusComposer(s.id, s.community && s.community.id, s.context_object_id, s.context_natural_key))
        })
        return res
    }
    loadStatuses = () => 
    {
        const { items, offset } = this.state
        const { limit } = this.props

        ApiClient.newsfeed(limit,offset,null, null, (data, status, error) => {
            if(data && data.results)
            {
                let newData = this.flattenData( data.results )
                this.setState({
                    items: offset == 0 ?  newData :  [...items, ...newData],
                    isRefreshing: false,
                    hasMore:data.next != null,
                    isLoading:false
                });
            }
        })
    }
    handleRefresh = () => 
    {
        if(this.state.isLoading)
        { // cancel current
            return
        }
        this.setState({
            offset: 0,
            isRefreshing: true,
            isLoading: true
        }, this.loadStatuses);
    }
    getClonedStatusCommentsLoader = (loader:StatusCommentLoader) => {

        return new StatusCommentLoader(loader.statusId, loader.currentCommentsCount, loader.totalCommentsCount)
    }
    getClonedStatus = (status:Status):Status => {

        return Immutable.fromJS(status).toJS()
    }
    updateStatusItem = (status:Status, index?:number, clone:boolean = false) => 
    {
        var i = index
        if (nullOrUndefined(i))
        {
            i = this.findIndexByStatusId(status.id)
        }
        const newStatus = clone ? this.getClonedStatus(status) : status
        let stateItems = this.state.items
        stateItems[i!] = newStatus
        this.setState({items:stateItems})
        return newStatus
    }
    handleReaction(reaction:string, status:Status) 
    {
        const clone = this.getClonedStatus(status)
        clone.serialization_date = new Date().toUTCString()
        let index = this.findIndexByStatusId(clone.id)
        let me = AuthenticationManager.getAuthenticatedUser()!
        let oldReaction = StatusUtilities.getStatusReaction(clone, me)
        let rCount = clone.reaction_count
        let r = clone.reactions || {}
        let userId = me.id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        clone.reactions = data.reactions
        clone.reaction_count = data.reactionsCount
        this.updateStatusItem(clone, index, false)
        ApiClient.reactToStatus(clone.id, reaction, (data, statusCode, error) => 
        {  
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                this.updateStatusItem(status) // setting old status
            }
        })
    }
    handleLoadMore = () => 
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState({
            offset: this.state.offset + this.props.limit,
            isLoading: true
        }, this.loadStatuses);
    }
    renderLoading() {
        if (this.state.isLoading) {
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
    updateItems = (updated:ArrayItem[]) => {
        this.setState(prevState => {
            const items = prevState.items
            updated.forEach(u => items[u.index] = u.object)
            return ({
                items: items,
              })
        })
    }
    insertObject = (object:FeedListItem, index:number) => {
        this.setState(prevState => {
            const items = prevState.items
            items.splice(index,0,object)
            return ({
                items: items,
              })
        })
    }
    removeObjectAtIndex = (index:number) => {
        this.setState(prevState => {
            const items = prevState.items
            items.splice(index,1)
            return ({
                items: items,
              })
        })
    }
    deleteStatus = (status:Status) => {
        console.log("deleteStatus", status.id)
        
        ApiClient.deleteStatus(status.id, (data, st, error) => {
            if(nullOrUndefined(error))
            {
                if(status.parent)
                {
                    const ix = this.findIndexByStatusId(status.parent)
                    if(ix > -1)
                    {
                        let updateArray:ArrayItem[] = []
                        const parent = this.getClonedStatus(this.state.items[ix] as Status)
                        parent.comments_count -= 1
                        updateArray.push({index:ix, object:parent})

                        let commentsLoaderIndex = this.findStatusCommentLoaderByStatusId(parent.id)
                        let commentLoader = this.state.items[commentsLoaderIndex] as StatusCommentLoader
                        if(commentLoader)
                        {
                            commentLoader.currentCommentsCount -= 1
                            commentLoader.totalCommentsCount -= 1
                            updateArray.push({index:commentsLoaderIndex, object:commentLoader})
                        }
                        this.updateItems(updateArray)
                    }
                }
                let index = this.findIndexByStatusId(status.id)
                this.removeObjectAtIndex(index)
            }
        })
    }
    updateStatus = (statusId:number, status:Status, files?:UploadedFile[], completion?:(success:boolean) => void) => {
        ApiClient.updateStatus(status, (data, reqStatus, error) => {
            if(data)
            {
                this.updateStatusItem(data)
            }
            else if (error)
            {
                ToastManager.showErrorToast(error)
            }
            if(completion)
            {
                completion(data && !error)
            }
        })
    }
    createNewComment = (parent:Status, message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void) => {
        const status = StatusUtilities.getStatusPreview(parent, message, mentions, files)
        let composerIndex = this.findStatusComposerByStatusId(parent.id)
        if(composerIndex > -1 )
        {
            this.insertObject(status,composerIndex)
            ApiClient.createStatus(status, (newObject, responseStatusCode, error) => {
                const success = !nullOrUndefined(newObject)
                if(success)
                {
                    //update parent comment_count & commentsloader data
                    let updateArray:ArrayItem[] = []
                    let newStatus = newObject as Status
                    let newStatusIndex = this.findIndexByStatusId(status.id)
                    updateArray.push({index:newStatusIndex, object:newStatus})
                    let updatedParent = this.getClonedStatus(parent)
                    updatedParent.comments_count += 1
                    let updatedParentIndex = this.findIndexByStatusId(parent.id)
                    updateArray.push({index:updatedParentIndex, object:updatedParent})
                    let commentsLoaderIndex = this.findStatusCommentLoaderByStatusId(parent.id)
                    let commentLoader = this.state.items[commentsLoaderIndex] as StatusCommentLoader
                    if(commentLoader)
                    {
                        commentLoader.currentCommentsCount += 1
                        commentLoader.totalCommentsCount += 1
                        updateArray.push({index:commentsLoaderIndex, object:commentLoader})
                    }
                    this.updateItems(updateArray)
                }
                console.log("status created----- replace temp", newObject )
                if(completion)
                    completion(success)
            })
        }
    }
    navigateToProfile = (profile:number) => {

    }
    navigateToCommunity = (community:number) => {

    }
    navigateToGroup = (group:number) => {

    }
    navigateToProject = (group:number) => {

    }
    navigateToWeb = (url:string) => {

    }
    navigateToAction = (status:Status, action:StatusActions, extra?:any) => 
    {
        const logWarn = () => 
        {
            console.warn("Missing Action handler for: ", action, extra)
        }
        switch(action)
        {
            case StatusActions.user: this.navigateToProfile(status.owner.id);break;
            case StatusActions.community: {
                let c = status.community && status.community.id
                if(c)
                    this.navigateToCommunity(c);
                break;
            }
            case StatusActions.context:
            {
                if(status.context_natural_key == ContextNaturalKey.GROUP)
                {
                    this.navigateToGroup(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == ContextNaturalKey.COMMUNITY)
                {
                    this.navigateToCommunity(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == ContextNaturalKey.USER)
                {
                    this.navigateToProfile(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == ContextNaturalKey.PROJECT)
                {
                    this.navigateToProject(status.context_object_id || -1)
                    break;
                }
                
            }
            case StatusActions.link:
            {
                if(extra && extra.link)
                {
                    this.navigateToWeb(extra.link)
                    break;
                }
                logWarn()
            }
            case StatusActions.new: 
            {
                if(extra && extra.message)
                {
                    this.createNewComment(status, extra.message, extra.mentions, extra.files, extra.completion)
                    break;
                }
                logWarn()
            }
            case StatusActions.edit: 
            {
                if(extra && extra.status)
                {
                    this.updateStatus(status.id, extra.status, extra.files, extra.completion)
                    break;
                }
                logWarn()
            }
            case StatusActions.delete: 
            {
                this.deleteStatus(status)
                break;
            }
            case StatusActions.react:this.handleReaction(extra.reaction, status); break;
            default:logWarn()
        }
    }
    navigateToActionWithId = (statusId:number) => (action:StatusActions, extra?:any) => 
    {
        let index = this.findIndexByStatusId(statusId)
        let status = this.state.items[index] as Status
        this.navigateToAction(status, action, extra)
    }
    renderStatus = (authUser:UserProfile, item:Status, isLast:boolean, index:number) => 
    {
        return <StatusComponent 
        canMention={true}
        canComment={true}
        canUpload={true}
        canReact={true}
        addLinkToContext={true}
        key={"status_" + item.id} 
        status={item} 
        bottomOptionsEnabled={true} 
        authorizedUserId={authUser.id}
        isLastComment={isLast}
        onActionPress={this.navigateToActionWithId(item.id)}
        />
    }
    renderStatusComposer = (composer:StatusComposer, index:number) => {
            return (
                <StatusFormContainer
                    key={"statuscomposer_" + composer.statusId}
                    canUpload={true}
                    canMention={true}
                    canComment={true}
                    className={"drop-shadow"}
                    statusId={composer.statusId}
                    onActionPress={this.navigateToActionWithId(composer.statusId)}
                    contextNaturalKey={composer.contextNaturalKey}
                    contextObjectId={composer.contextObjectId}
                    communityId={composer.communityId}
                    />
            )
    }
    findStatusComposerByStatusId = (statusId:number) => 
    {
        return this.state.items.findIndex( o => {
            if(o instanceof StatusComposer)
            {   
                return (o as StatusComposer).statusId == statusId
            }
            return false
        })
    }
    findIndexByStatusId(statusId:number)
    {
        return this.state.items.findIndex(o => {
            if(o.hasOwnProperty('id'))
            {
                return (o as Status).id == statusId
            }
            return false
        })
    }
    findStatusCommentLoaderByStatusId = (statusId:number) => 
    {
        return this.state.items.findIndex( o => {
            if(o instanceof StatusCommentLoader)
            {   
                return (o as StatusCommentLoader).statusId == statusId
            }
            return false
        })
    }
    didLoadMoreComments = (loader:StatusCommentLoader, comments:Status[]) => 
    {
        var commentLoaderIndex = this.findStatusCommentLoaderByStatusId(loader.statusId) 
        if(loader instanceof StatusCommentLoader)
        {
            let l = loader as StatusCommentLoader
            let newCommentLoader = new StatusCommentLoader(l.statusId, l.currentCommentsCount + comments.length, l.totalCommentsCount)
            this.setState(prevState => {
                const prevLoaders = prevState.activeCommentLoaders
                delete prevLoaders[commentLoaderIndex]
                const items = prevState.items
                if(newCommentLoader.currentCommentsCount == newCommentLoader.totalCommentsCount)
                {
                    items.splice(commentLoaderIndex, 1)
                    commentLoaderIndex -= 1
                }  
                else 
                {
                    items[commentLoaderIndex] = newCommentLoader
                }
                items.splice(commentLoaderIndex + 1,0,...comments.reverse())
                return ({
                    items: items,
                    activeCommentLoaders:prevLoaders,
                  })
            })
        }

        console.log("didLoadMoreComments")
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
            let currentLoaders = this.state.activeCommentLoaders
            if (delete currentLoaders[loader.statusId])
            {
                this.setState({activeCommentLoaders:currentLoaders})
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
            <button disabled={isLoading} key={"statusloader_" + loader.statusId} className="btn btn-link link-text comment-loader" onClick={this.loadMoreComments(loader)}>
                {!isLoading && <i className="fa fa-arrow-down"/>} 
                {isLoading && <CircularLoadingSpinner size={16} />} 
                &nbsp;{translate("Show previous")}
            </button>
        )
    }
    render() {
        let authUser = AuthenticationManager.getAuthenticatedUser()
        if(!authUser)
        {
            return null
        }
        const len = this.state.items.length
        return(
            <FullPageComponent> 
                    <List 
                    enableAnimation={false} 
                    onScroll={this.onScroll} 
                    className="status-list full-height col-sm group-list vertical-scroll">
                        {this.state.items.map((s, i) => {
                            const next = len > i + 1 ? this.state.items[i + 1] : undefined
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
    return {
        authenticatedProfile:state.auth.profile,
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsFeed));