import * as React from 'react';
import { connect } from 'react-redux'
import { StatusUtilities } from '../../utilities/StatusUtilities';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import { withRouter } from 'react-router';
import * as Immutable from 'immutable';
import ApiClient from '../../network/ApiClient';
import { ReduxState } from '../../redux/index';
import { UserProfile, Status, UploadedFile, ContextNaturalKey, StatusActions, ObjectAttributeType, Permission } from '../../types/intrasocial_types';
import { nullOrUndefined } from '../../utilities/Utilities';
import { ToastManager } from '../../managers/ToastManager';
import { StatusComponent } from '../../components/status/StatusComponent';
import { StatusComposerComponent } from '../../components/status/StatusComposerComponent';
import { StatusCommentLoader as CommentLoader } from '../../components/status/StatusCommentLoader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { List } from '../../components/general/List';
import "./NewsfeedComponent.scss"
import { ResizeObserverComponent } from '../../components/general/observers/ResizeObserverComponent';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import classnames = require('classnames');
import { translate } from '../../localization/AutoIntlProvider';
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
interface OwnProps 
{
    limit:number
    contextNaturalKey?:string
    contextObjectId?:number
    includeSubContext?:boolean 
    filter:ObjectAttributeType
    defaultChildrenLimit:number//children fetched upfront
    childrenLimit:number//children when fetching pages
    scrollParent?:any
    onLoadingStateChanged?:(isLoading:boolean) => void
    isResolvingContext?:boolean
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
    items:FeedListItem[]
    offset:number
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    hasLoaded:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class NewsfeedComponent extends React.Component<Props, State> {
    isOdd:boolean = false
    static defaultProps:OwnProps = {
        limit:30,
        defaultChildrenLimit:5,
        childrenLimit:10,
        includeSubContext:true,
        filter:null
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            activeCommentLoaders:{},
            isLoading: false,
            isRefreshing:false,
            items:[],
            offset:0,
            hasMore:true,
            hasLoaded:false
        }
    }
    hasContextError = (props:Props) => {
        return (!!props.contextNaturalKey && !props.contextObjectId) || (!props.contextNaturalKey && !!props.contextObjectId)

    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.props.contextNaturalKey != prevProps.contextNaturalKey || 
            this.props.contextObjectId != prevProps.contextObjectId || 
            this.props.includeSubContext != prevProps.includeSubContext || 
            this.props.isResolvingContext != prevProps.isResolvingContext || 
            this.props.filter != prevProps.filter)
        {
            const hasContextError = this.hasContextError(this.props)
            const action = hasContextError ? undefined : this.loadStatuses
            this.setState({
                offset: 0,
                isRefreshing: !hasContextError,
                isLoading: !hasContextError,
                items:[],
                hasLoaded:false
            }, action);
        }
        if(this.props.onLoadingStateChanged && prevState.isLoading != this.state.isLoading)
        {
            this.props.onLoadingStateChanged(this.state.isLoading)
        }
    }
    componentDidMount = () => 
    {
        if(this.props.scrollParent)
        {
            this.props.scrollParent.addEventListener("scroll", this.onScroll)
        }
        
        const hasContextError = this.hasContextError(this.props)
        if(!hasContextError)
        {
            this.setState({
                isLoading: true
            }, this.loadStatuses);
        }
    }
    componentWillUnmount = () =>
    {
        if(this.props.scrollParent)
        {
            this.props.scrollParent.removeEventListener("scroll", this.onScroll)
        }
    }
    onScroll = (event:any) =>
    {
        let isAtBottom = false
        if(event.target instanceof Document)
            isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight
        else 
            isAtBottom = event.target.scrollTop + event.target.offsetHeight >= event.target.scrollHeight
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
                if(s.comments != c.length)
                {
                    res.push(new StatusCommentLoader(s.id, c.length, s.comments))
                }
                res = res.concat(this.flattenData(c).reverse())
            }
            if(nullOrUndefined( s.parent ) && s.permission >= Permission.post)
                res.push(new StatusComposer(s.id, s.community && s.community.id, s.context_object_id , s.context_natural_key))
        })
        return res
    }
    loadStatuses = () => 
    {
        const { items, offset } = this.state
        const { limit, contextNaturalKey, contextObjectId } = this.props
        ApiClient.newsfeedV2(limit,offset,contextNaturalKey, contextObjectId, null, this.props.defaultChildrenLimit, this.props.filter, this.props.includeSubContext, (data, status, error) => {
            if(data && data.results)
            {
                let newData = this.flattenData( data.results )
                this.setState({
                    items: offset == 0 ?  newData :  [...items, ...newData],
                    isRefreshing: false,
                    hasMore:data.next != null,
                    isLoading:false,
                    hasLoaded:true
                });
            }
            ToastManager.showErrorToast(error)
        })
    }
    handleRefresh = () => 
    {
        if(this.state.isLoading || this.hasContextError(this.props))
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
    handleDeleteAttribute(id:number, status:Status) {
        ApiClient.deleteStatusAttribute(id, (data, st, error) => {
            if(nullOrUndefined(error))
            {
                const clone = this.getClonedStatus(status)
                clone.serialization_date = new Date().toISOString()
                const attrs = clone.attributes || []
                const index = attrs.findIndex(e => e.id == id) 
                if(index > -1)
                {
                    attrs.splice(index, 1)
                }
                this.updateStatusItem(clone)
            }
            ToastManager.showErrorToast(error)
        })
    }
    handleCreateAttribute(status:Status, type:ObjectAttributeType, user?:number, completion?:(success:boolean) => void )
    {
        ApiClient.createStatusAttribute(status.id, type, user, (data, st, error) => {
            if(data)
            {
                const clone = this.getClonedStatus(status)
                clone.serialization_date = new Date().toISOString()
                const attrs = clone.attributes || []
                attrs.push(data)
                this.updateStatusItem(clone)
            }
            ToastManager.showErrorToast(error)
            completion && completion(!!data)
        })
    }
    handleReaction(reaction:string, status:Status) 
    {
        const clone = this.getClonedStatus(status)
        clone.serialization_date = new Date().toISOString()
        let index = this.findIndexByStatusId(clone.id)
        let me = this.props.authenticatedProfile
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
            ToastManager.showErrorToast(error)
        })
    }
    handleLoadMore = () => 
    {
        if(!this.state.hasMore || this.state.isLoading || this.hasContextError(this.props))
        {
            return
        }
        this.setState({
            offset: this.state.offset + this.props.limit,
            isLoading: true
        }, this.loadStatuses);
    }
    renderLoading = () => {
        if (this.state.isLoading || this.props.isResolvingContext) {
            return (<LoadingSpinner key="loading"/>)
        }
        return null
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
    removeObjectsAtIndexes = (indexes:number[]) => {
        const arr = indexes.sort((a, b) => b - a) //descending
        this.setState(prevState => {
            const items = prevState.items
            arr.forEach(i => {
                delete items[i]
            })
            return ({
                items: items.filter(i => !nullOrUndefined(i)),
              })
        })
    }
    deleteStatus = (status:Status) => {
        console.log("deleteStatus", status.id)
        
        ApiClient.deleteStatus(status.id, (data, st, error) => {
            const indexesToDelete:number[] = []
            if(nullOrUndefined(error))
            {
                if(status.parent)//update parent and commentloader
                {
                    const ix = this.findIndexByStatusId(status.parent)
                    if(ix > -1)
                    {
                        let updateArray:ArrayItem[] = []
                        const parent = this.getClonedStatus(this.state.items[ix] as Status)
                        parent.comments -= 1
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
                else // root status, remove children, commentLoader and status composer
                {

                    let commentsLoaderIndex = this.findStatusCommentLoaderByStatusId(status.id)
                    if(commentsLoaderIndex)
                        indexesToDelete.push(commentsLoaderIndex)
                    let cIndex = this.findStatusComposerByStatusId(status.id)
                    indexesToDelete.push(cIndex)
                    const childIndexes = this.findCommentsByStatusId(status.id)
                    indexesToDelete.push(...childIndexes)
                }
                let index = this.findIndexByStatusId(status.id)
                indexesToDelete.push(index)
                this.removeObjectsAtIndexes(indexesToDelete)
            }
            ToastManager.showErrorToast(error)
        })
    }
    updateStatus = (statusId:number, status:Status, files?:UploadedFile[], completion?:(success:boolean) => void) => {
        ApiClient.updateStatus(status, (data, reqStatus, error) => {
            if(data)
            {
                this.updateStatusItem(data)
            }
            if(completion)
            {
                completion(data && !error)
            }
            ToastManager.showErrorToast(error)
        })
    }
    createNewComment = (parent:Status, message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void) => {
        const status = StatusUtilities.getCommentPreview(parent, message, mentions, files)
        let composerIndex = this.findStatusComposerByStatusId(parent.id)
        if(composerIndex > -1 )
        {
            this.insertObject(status,composerIndex)
            ApiClient.createStatus(status, (newObject, responseStatusCode, error) => {
                newObject.temporary = true
                const success = !nullOrUndefined(newObject)
                if(success)
                {
                    //update parent comment_count & commentsloader data
                    let updateArray:ArrayItem[] = []
                    let newStatus = newObject as Status
                    let newStatusIndex = this.findIndexByStatusId(status.id)
                    updateArray.push({index:newStatusIndex, object:newStatus})
                    let updatedParent = this.getClonedStatus(parent)
                    updatedParent.comments += 1
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
                ToastManager.showErrorToast(error)
            })
        }
    }
    navigateToSearch = (query:string) => {
        NavigationUtilities.navigateToSearch(this.props.history, query)
    }
    navigateToProfile = (profile:number) => {
        NavigationUtilities.navigateToProfileId(this.props.history, profile )
    }
    navigateToCommunity = (community:number) => {
        NavigationUtilities.navigateToCommunity(this.props.history, community )
    }
    navigateToGroup = (group:number) => {
        NavigationUtilities.navigateToGroup(this.props.history, group )
    }
    navigateToProject = (project:number) => {
        NavigationUtilities.navigateToProject(this.props.history, project )
    }
    navigateToTask = (task:number) => {
        NavigationUtilities.navigateToTask(this.props.history, task )
    }
    navigateToEvent = (event:number) => {
        NavigationUtilities.navigateToEvent(this.props.history, event )
    }
    navigateToWeb = (url:string) => {
        NavigationUtilities.navigateToUrl(this.props.history, url)
    }
    navigateToAction = (status:Status, action:StatusActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        const logWarn = () => 
        {
            console.warn("Missing Action handler for: ", action, extra)
        }
        switch(action)
        {
            case StatusActions.search: 
            {
                this.navigateToSearch(extra && extra.query)
                break;
            }
            case StatusActions.user: 
            {
                const profile = extra && extra.profile && extra.profile.id || status.owner.id
                this.navigateToProfile(profile);
                break;
            }
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
                }
                else if(status.context_natural_key == ContextNaturalKey.COMMUNITY)
                {
                    this.navigateToCommunity(status.context_object_id || -1)
                }
                else if(status.context_natural_key == ContextNaturalKey.USER)
                {
                    this.navigateToProfile(status.context_object_id || -1)
                }
                else if(status.context_natural_key == ContextNaturalKey.PROJECT)
                {
                    this.navigateToProject(status.context_object_id || -1)
                }
                else if(status.context_natural_key == ContextNaturalKey.EVENT)
                {
                    this.navigateToEvent(status.context_object_id || -1)
                }
                else if(status.context_natural_key == ContextNaturalKey.TASK)
                {
                    this.navigateToTask(status.context_object_id || -1)
                }
                else 
                {
                    logWarn()
                }
                break;
                
            }
            case StatusActions.link:
            {
                if(extra && extra.link)
                {
                    this.navigateToWeb(extra.link)
                }
                else 
                {
                    logWarn()
                }
                break;
            }
            case StatusActions.new: 
            {
                if(extra && extra.message)
                {
                    this.createNewComment(status, extra.message, extra.mentions, extra.files, extra.completion)
                }
                else 
                {
                    logWarn()
                }
                break;
            }
            case StatusActions.edit: 
            {
                if(extra && extra.status)
                {
                    this.updateStatus(status.id, extra.status, extra.files, extra.completion)
                }
                else 
                {
                    logWarn()
                }
                break;
            }
            case StatusActions.delete: 
            {
                this.deleteStatus(status)
                break;
            }
            case StatusActions.react:
            {
                this.handleReaction(extra.reaction, status); 
                break;
            }
            case StatusActions.createAttribute:
            {
                this.handleCreateAttribute(status, extra.type, extra.user , completion); 
                break;
            }
            case StatusActions.deleteAttribute:
            {
                this.handleDeleteAttribute(extra.id, status); 
                break;
            }
            default:logWarn()
        }
    }
    navigateToActionWithId = (statusId:number) => (action:StatusActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        let index = this.findIndexByStatusId(statusId)
        let status = this.state.items[index] as Status
        this.navigateToAction(status, action, extra, completion)
    }
    renderStatus = (authUser:UserProfile, item:Status, isComment:boolean, index:number, color:string, breakpoint:ResponsiveBreakpoint) => 
    {
        return <StatusComponent 
                    canUpload={true}
                    addLinkToContext={true}
                    key={"status_" + item.id} 
                    status={item} 
                    bottomOptionsEnabled={true} 
                    authorizedUserId={authUser.id}
                    isComment={isComment}
                    onActionPress={this.navigateToActionWithId(item.id)}
                    className={color}
                    breakpoint={breakpoint}
                />
    }
    renderStatusComposer = (composer:StatusComposer, index:number, color:string, breakpoint:ResponsiveBreakpoint) => {
            return (
                <StatusComposerComponent
                    key={"statuscomposer_" + composer.statusId}
                    canUpload={true}
                    canMention={true}
                    canComment={true}
                    className={color}
                    onActionPress={this.navigateToActionWithId(composer.statusId)}
                    contextNaturalKey={composer.contextNaturalKey}
                    contextObjectId={composer.contextObjectId}
                    communityId={composer.communityId}
                    taggableMembers={this.getStatusTaggableMembers(composer.statusId)}
                />
            )
    }
    renderCommentLoader =  (loader: StatusCommentLoader, index:number, color:string, breakpoint:ResponsiveBreakpoint) => 
    {
        const isLoading = this.state.activeCommentLoaders[loader.statusId] != undefined
        return <CommentLoader 
                    key={"statusloader_" + loader.statusId} 
                    className={color} 
                    isLoading={isLoading} 
                    loadMoreComments={this.loadMoreComments(loader)}/>
    }
    getStatusTaggableMembers = (statusId:number) => {
        const status = this.findStatusByStatusId(statusId)
        return status.visibility
    }
    findStatusByStatusId = (statusId:number) => 
    {
        return this.state.items.find(o => {
            if(o.hasOwnProperty('id'))
            {
                return (o as Status).id == statusId
            }
            return false
        }) as Status
    }
    findCommentsByStatusId = (statusId:number) => 
    {
        const result:number[] = []
        this.state.items.forEach( (o, i) => {
            if(o.hasOwnProperty('id'))
            {  
                if((o as Status).parent == statusId)
                {
                    result.push(i)
                }
            }
        })
        return result
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
        const rest = loader.totalCommentsCount - loader.currentCommentsCount
        const requestingCount = Math.min(this.props.childrenLimit, rest)
        const offset = Math.max(0, rest - requestingCount)
        console.log("loadItems comments", "limit:" + requestingCount, "offset:"+offset)
        ApiClient.statusComments(loader.statusId, offset, requestingCount, false, (data, status, error) => {
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
            ToastManager.showErrorToast(error)
        })
    }
    loadMoreComments = (loader:StatusCommentLoader) => (e:any) => 
    {
        console.log("loadMoreFromLoader", loader.statusId)
        let currentLoaders = this.state.activeCommentLoaders
        currentLoaders[loader.statusId] = loader
        this.setState({activeCommentLoaders:currentLoaders}, () => {this._loadComments(loader)})
    
    }
    getNextColor = () => {
        const c = this.isOdd ? "odd-color" : "even-color"
        this.isOdd = !this.isOdd 
        return c
    }
    renderError = () => {
        if(!this.props.isResolvingContext && this.hasContextError(this.props) )
        {
            return <div className="module-content-error">{translate("common.context.error")}</div>
        }
        return null
    }
    renderEmpty = () => {
        if(!this.state.isLoading && this.state.hasLoaded && this.state.items.length == 0)
        {
            return <div className="module-content-empty">{translate("common.module.empty")}</div>
        }
        return null
    }
    render() {
        let authUser = this.props.authenticatedProfile
        if(!authUser)
        {
            return null
        }
        this.isOdd = false
        let color = this.getNextColor()
        const scroll = this.props.scrollParent ? undefined : this.onScroll
        return(
            <ResizeObserverComponent className="newsfeed-component" render={({breakpoint}) => {
                console.log("new breakpoint", breakpoint)
                const cn = classnames("status-list vertical-scroll", "rb-" + ResponsiveBreakpoint[breakpoint])
                return <>
                    <List 
                    enableAnimation={false} 
                    onScroll={scroll} 
                    className={cn}>
                        {this.state.items.map((s, i) => {
                            if(s instanceof StatusComposer)
                            {
                                const comp = this.renderStatusComposer(s, i, color, breakpoint)
                                color = this.getNextColor()
                                return comp
                            }
                            else if(s instanceof StatusCommentLoader)
                            {
                                return this.renderCommentLoader(s, i, color, breakpoint)
                            }
                            const isComment = !!s.parent
                            return this.renderStatus(authUser, s, isComment, i, color, breakpoint)
                        }).concat(this.renderLoading()) }
                    </List>
                    {this.renderError()}
                    {this.renderEmpty()}
                </>
            }}> 
            </ResizeObserverComponent> 
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => 
{
    return {
        authenticatedProfile:state.authentication.profile,
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsfeedComponent));