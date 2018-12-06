import * as React from 'react';
import { connect } from 'react-redux'
import { RootState } from '../../reducers';
import { nullOrUndefined } from '../../utilities/Utilities';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { List } from '../../components/general/List';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import StatusComponent, { StatusActions } from '../../components/general/status/StatusComponent';
import { StatusManager } from '../../managers/StatusManager';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { Status, UserProfile, UploadedFile } from '../../types/intrasocial_types';
import StatusFormContainer from '../../components/general/status/StatusFormContainer';
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { StatusUtilities } from '../../utilities/StatusUtilities';
import { withRouter } from 'react-router';
import * as Immutable from 'immutable';
require("./NewsFeed.scss");

class StatusComposer
{
    statusId:number
    communityId?:number
    contextNaturalKey:string
    contextObjectId:number
    constructor(statusId:number,contextNaturalKey:string, contextObjectId:number, communityId?:number )
    {
        this.statusId = statusId
        this.contextNaturalKey = contextNaturalKey
        this.contextObjectId = contextObjectId
        this.communityId = communityId
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
        this.onCommentDelete = this.onCommentDelete.bind(this)
        this.onStatusDelete = this.onStatusDelete.bind(this)
        this.onCommentSubmit = this.onCommentSubmit.bind(this)
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
                res.push(new StatusComposer(s.id, s.context_natural_key, s.context_object_id, s.community && s.community.id))
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
    updateStatus = (status:Status, index?:number, clone:boolean = false) => 
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
    handleReaction(reaction:string, status:Status) {

        const clone = this.getClonedStatus(status)
        let index = this.findIndexByStatusId(clone.id)
        let me = AuthenticationManager.getAuthenticatedUser()!
        let oldReaction = StatusUtilities.getStatusReaction(clone, me)
        let rCount = clone.reaction_count
        let r = clone.reactions || {}
        let userId = me.id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        clone.reactions = data.reactions
        clone.reaction_count = data.reactionsCount
        this.updateStatus(clone, index, false)
        ApiClient.reactToStatus(clone.id, reaction, (data, statusCode, error) => 
        {  
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                this.updateStatus(status) // setting old status
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
    onCommentDelete(comment:Status)
    {
        console.log("onCommentDelete", comment)
    }
    onStatusDelete(removeId:number)
    {
        console.log("onStatusDelete", removeId)
        ApiClient.deleteStatus(removeId, (data, status, error) => {
            if(nullOrUndefined(error) )
            {
                StatusManager.removeStatus(removeId)
            }
        })
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
                    parent.comments_count += 1
                    let updatedParent = this.getClonedStatus(parent)
                    let updatedParentIndex = this.findIndexByStatusId(parent.id)
                    updateArray.push({index:updatedParentIndex, object:updatedParent})
                    let commentsLoaderIndex = this.findStatusCommentLoaderByStatusId(parent.id)
                    let commentLoader = this.state.items[commentsLoaderIndex] as StatusCommentLoader
                    if(commentLoader)
                    {
                        commentLoader.currentCommentsCount += 1
                        commentLoader.totalCommentsCount += 1
                        let updatedCommentsLoader = this.getClonedStatusCommentsLoader(commentLoader)
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
                if(status.context_natural_key == "group.group")
                {
                    this.navigateToGroup(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == "core.community")
                {
                    this.navigateToCommunity(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == "auth.user")
                {
                    this.navigateToProfile(status.context_object_id || -1)
                    break;
                }
                else if(status.context_natural_key == "project.project")
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
        onStatusEdit={this.onStatusEdit}
        onCommentEdit={this.onCommentEdit}
        onCommentDelete={this.onCommentDelete}
        onStatusDelete={this.onStatusDelete}
        onCommentSubmit={this.onCommentSubmit}
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
                    onCommentSubmit={this.onCommentSubmit} 
                    className={"drop-shadow"}
                    contextNaturalKey={composer.contextNaturalKey}
                    contextObjectId={composer.contextObjectId}
                    statusId={composer.statusId}
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
            <button key={"statusloader_" + loader.statusId} className="btn btn-link link-text comment-loader" onClick={this.loadMoreComments(loader)}>
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