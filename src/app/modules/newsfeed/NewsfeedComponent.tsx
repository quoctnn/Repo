import * as React from 'react';
import { connect } from 'react-redux'
import { StatusUtilities } from '../../utilities/StatusUtilities';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import { withRouter } from 'react-router';
import * as Immutable from 'immutable';
import {ApiClient} from '../../network/ApiClient';
import { ReduxState } from '../../redux/index';
import { UserProfile, Status, UploadedFile, ContextNaturalKey, StatusActions, ObjectAttributeType, Permission, Permissible, ContextObject, IdentifiableObject } from '../../types/intrasocial_types';
import { nullOrUndefined, uniqueId, userFullName } from '../../utilities/Utilities';
import { ToastManager } from '../../managers/ToastManager';
import { StatusComponent } from '../../components/status/StatusComponent';
import { StatusCommentLoader as CommentLoader } from '../../components/status/StatusCommentLoader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { List } from '../../components/general/List';
import "./NewsfeedComponent.scss"
import classnames = require('classnames');
import { translate } from '../../localization/AutoIntlProvider';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { EventStreamMessageType } from '../../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
import { Mention } from '../../components/general/input/MentionEditor';
import { StatusComposerComponent } from '../../components/general/input/StatusComposerComponent';
import { ReadObserver } from '../../library/ReadObserver';
import { ProfileManager } from '../../managers/ProfileManager';
import ReactDOM = require('react-dom');

class StatusComposer
{
    statusId:number
    communityId:number
    contextObjectId:number
    contextNaturalKey:ContextNaturalKey
    level:number
    content?:string
    composerRef?:React.RefObject<StatusComposerComponent>
    forceUpdate?:string
    constructor(statusId:number, communityId:number, contextObjectId:number, contextNaturalKey:ContextNaturalKey, level:number, content?:string)
    {
        this.statusId = statusId
        this.communityId = communityId
        this.contextObjectId = contextObjectId
        this.contextNaturalKey = contextNaturalKey
        this.level = level
        this.content = content
        this.composerRef = React.createRef<StatusComposerComponent>()
    }
    composerFocus = () => {

    }
}
class StatusCommentLoader
{
    statusId:number
    position:number
    level:number
    loadNewer:boolean
    constructor(statusId:number, position:number, loadNewer:boolean, level:number)
    {
        this.statusId = statusId
        this.position = position
        this.loadNewer = loadNewer
        this.level = level
    }
    toString = () => {
        return `StatusCommentLoader status:${this.statusId} position:${this.position} loadNewer:${this.loadNewer}`
    }
}
type FeedListItem = Status | StatusComposer | StatusCommentLoader
type ArrayItem =
{
    index:number
    object:FeedListItem
}
type OwnProps = {
    limit:number
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    contextObject?:Permissible & IdentifiableObject
    includeSubContext?:boolean
    filter:ObjectAttributeType
    reloadContext?:string
    defaultChildrenLimit:number//children fetched upfront
    childrenLimit:number//children when fetching pages
    scrollParent?:any
    onLoadingStateChanged?:(isLoading:boolean) => void
    isResolvingContext?:boolean
    rootStatus?:Status
    highlightStatusId?:number
}
type RouteProps = {
    history:any
    location: any
    match:any
}
type ReduxStateProps = {
    authenticatedProfile:UserProfile,
}
type ReduxDispatchProps = {
}
type State = {
    activeCommentLoaders:{[key:string]:StatusCommentLoader}
    items:FeedListItem[]
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    hasLoaded:boolean
    highlightComplete:boolean
}
type IncomingUpdateItem = {
    type:string
    id:number
    parent_id?:number
    position?:number
}
type IncomingInteractionItem = {
    interaction_id:number
    reaction:string
    user_id:number
} & IncomingUpdateItem
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
export class NewsfeedComponent extends React.Component<Props, State> {
    private isOdd:boolean = false
    private observers:EventSubscription[] = []
    private stashIncomingUpdates = false
    private incomingUpdateCache:IncomingUpdateItem[] = []
    private listRef = React.createRef<List>()
    private highlightRef = React.createRef<StatusComponent>()
    private readObserver = null;
    private _mounted = true
    static defaultProps:OwnProps = {
        limit:30,
        defaultChildrenLimit:5,
        childrenLimit:10,
        includeSubContext:true,
        filter:null
    }
    constructor(props:Props) {
        super(props);
        const hasStatus = !!props.rootStatus
        const items = hasStatus ? this.flattenData([props.rootStatus]) : []
        this.state = {
            activeCommentLoaders:{},
            isLoading: false,
            isRefreshing:false,
            items:items,
            hasMore:!hasStatus,
            hasLoaded:hasStatus,
            highlightComplete:false
        }
    }
    readObserverActiveStateChanged = (isActive:boolean) => {
        if(isActive && !this.props.authenticatedProfile.is_anonymous)
        {
            this.readObserver.clearObservables()
            this.forceUpdate()
        }
    }
    registerObservee = (id:number) => (element:Element) => {
        if(!!element && !!this.readObserver)
            this.readObserver.observe(id, element)
    }
    completeHighlight = () => {
        if(this.highlightRef && this.highlightRef.current && !this.state.highlightComplete)
        {
            const highlightId = this.props.highlightStatusId
            if(!nullOrUndefined( highlightId ))
            {
                const status = this.findStatusByStatusId(highlightId)
                if(status)
                    this.scheduleHighlightRemoval(status)
            }
            this.setState((prevState:State) => {
                return {highlightComplete:true}
            }, () => {
                const node = ReactDOM.findDOMNode(this.highlightRef.current) as HTMLElement
                if(node)
                {
                    node.scrollIntoView({behavior: "smooth", block: "start"})
                }
            })
        }
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.props.contextNaturalKey != prevProps.contextNaturalKey ||
            this.props.contextObjectId != prevProps.contextObjectId ||
            this.props.contextObject != prevProps.contextObject ||
            this.props.includeSubContext != prevProps.includeSubContext ||
            this.props.isResolvingContext != prevProps.isResolvingContext ||
            this.props.filter != prevProps.filter ||
            this.props.reloadContext)
        {
            const hasContextError = this.hasContextError(this.props)
            const action = hasContextError ? undefined : this.loadStatuses
            this.setState({
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
        this.completeHighlight()
    }
    componentDidMount = () =>
    {
        if (!this.props.authenticatedProfile.is_anonymous){
            this.readObserver = new ReadObserver("statusReads", ApiClient.setStatusesRead)
            this.readObserver.onActiveStateChanged = this.readObserverActiveStateChanged
            const listRef = this.listRef.current.listRef.current
            if(listRef)
            {
                this.readObserver.initialize(listRef)
            }
        }
        const obs1 = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.STATUS_NEW, this.processIncomingStatusNew)
        this.observers.push(obs1)
        const obs2 = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.STATUS_UPDATE, this.processIncomingStatusUpdate)
        this.observers.push(obs2)
        const obs3 = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.STATUS_DELETED, this.processIncomingStatusDeleted)
        this.observers.push(obs3)
        const obs4 = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.STATUS_INTERACTION_UPDATE, this.processIncomingStatusInteractionUpdate)
        this.observers.push(obs4)
        if(this.props.scrollParent)
        {
            this.props.scrollParent.addEventListener("scroll", this.onScroll)
        }

        const hasContextError = this.hasContextError(this.props)
        if(!hasContextError && this.state.hasMore)
        {
            this.setState({
                isLoading: true
            }, this.loadStatuses);
        }
        this.completeHighlight()
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null
        if(this.props.scrollParent)
        {
            this.props.scrollParent.removeEventListener("scroll", this.onScroll)
        }
        this.incomingUpdateCache = null
        if(!!this.readObserver){
            this.readObserver.save()
            this.readObserver.cleanup()
            this.readObserver = null
        }
        this.listRef = null
        this._mounted = false
    }
    setStashUpdates = (stash:boolean) => {
        this.stashIncomingUpdates = stash
        if(!stash)
        {
            const arr = this.incomingUpdateCache
            this.incomingUpdateCache = []
            arr.forEach(this.runIncomingUpdate)
        }
    }
    hasContextError = (props:Props) => {
        return (!!props.contextNaturalKey && !props.contextObjectId) || (!props.contextNaturalKey && !!props.contextObjectId)

    }
    private processIncomingStatusNew = (...args:any[]) => {
        const object = args[0]
        const id = object && object.id
        if(id)
        {
            const update:IncomingUpdateItem = {type:EventStreamMessageType.STATUS_NEW, ...object}
            this.processIncomingUpdate(update)
        }
    }
    private fetchComment = (id:number) => () => {
        ApiClient.getStatus(id, (comment, requestStatus, error) => {
            if(!this._mounted)
                return
            if(comment)
            {
                this.insertOrUpdateComment(comment)
            }
            this.setState({ isLoading: false })//TODO: do this in this.updateItems or here?
            ToastManager.showRequestErrorToast(error)
        })
    }
    private fetchUpdates = () => {
        const firstStatus = this.state.items[0] as Status
        if(firstStatus && firstStatus.id)
        {
            const { limit, contextNaturalKey, contextObjectId } = this.props
            ApiClient.newsfeedV2(limit, 0, contextNaturalKey, contextObjectId, null, this.props.defaultChildrenLimit, this.props.filter, this.props.includeSubContext, firstStatus.id, (data, status, error) => {
                if(!this._mounted)
                    return
                if(data && data.results)
                {
                    const { items } = this.state
                    let newData = this.flattenData( data.results )
                    this.setState({
                        items: [...newData, ...items],
                        isRefreshing: false,
                        isLoading:false,
                    });
                }
                ToastManager.showRequestErrorToast(error)
            })
        }
    }
    private processIncomingStatusUpdate = (...args:any[]) => {
        const object = args[0]
        const id = object && object.id
        if(id)
        {
            const update:IncomingUpdateItem = {type:EventStreamMessageType.STATUS_UPDATE, ...object}
            this.processIncomingUpdate(update)
        }
    }
    private processIncomingUpdate = (update:IncomingUpdateItem) => {
        if(this.stashIncomingUpdates)
        {
            this.incomingUpdateCache.push(update)
        }
        else {
            this.runIncomingUpdate(update)
        }
    }
    private runIncomingUpdate = (update:IncomingUpdateItem) => {
        if(update.type == EventStreamMessageType.STATUS_DELETED)
            this.executeStatusDelete(update)
        else if(update.type == EventStreamMessageType.STATUS_NEW)
            this.extecuteStatusNew(update)
        else if(update.type == EventStreamMessageType.STATUS_UPDATE)
            this.executeStatusUpdate(update)
        else if(update.type == EventStreamMessageType.STATUS_INTERACTION_UPDATE)
            this.executeInteractionUpdate(update as IncomingInteractionItem)
    }
    private extecuteStatusNew = (update:IncomingUpdateItem) => {
        if(update.parent_id)
        {
            const parent = this.findStatusByStatusId(update.parent_id)
            if(parent)
            {
                this.setState({
                    isLoading: true
                }, this.fetchComment(update.id));
            }
        }
        else
        {
            if(this.props.rootStatus)
                return
            this.setState({
                isLoading: true
            }, this.fetchUpdates);
        }
    }
    private executeInteractionUpdate = (update:IncomingInteractionItem) => {
        const oldStatus = this.findStatusByStatusId(update.id)
        if(oldStatus)
        {
            const status = this.getClonedStatus(oldStatus)
            status.serialization_date = new Date().toISOString()
            const oldReaction = StatusUtilities.getStatusReaction(status, update.user_id)
            const reactions = status.reactions || {}
            const data = StatusUtilities.applyReaction(oldReaction, update.reaction, reactions, status.reaction_count, update.user_id)
            status.reactions = data.reactions
            status.reaction_count = data.reactionsCount
            this.updateStatusItem(status)
        }
    }
    private executeStatusUpdate = (update:IncomingUpdateItem) => {
            //fetch & update if feed contains status
            const oldStatus = this.findStatusByStatusId(update.id)
            if(oldStatus)
            {
                ApiClient.getStatus(update.id, (status, reqStatus, error) => {
                    if(!this._mounted)
                        return
                    if(status)
                        this.updateStatusItem(status)
                })
            }

    }
    private executeStatusDelete = (update:IncomingUpdateItem) => {

        this.postDeleteStatus(update)
    }
    private processIncomingStatusDeleted = (...args:any[]) => {
        const object = args[0]
        const id = object && object.id
        if(id)
        {
            const update:IncomingUpdateItem = {type:EventStreamMessageType.STATUS_DELETED, ...object}
            this.processIncomingUpdate(update)
        }
    }
    private processIncomingStatusInteractionUpdate = (...args:any[]) => {
        const object = args[0]
        const id = object && object.id
        if(id)
        {
            const update:IncomingInteractionItem = {type:EventStreamMessageType.STATUS_INTERACTION_UPDATE, ...object}
            this.processIncomingUpdate(update)
        }
    }
    onScroll = (event) =>
    {
        if(!this.props.scrollParent && this.listRef.current.listRef.current != event.target)
            return
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
            let c = s.children || []//node children
            this.applyContextToStatuses(c, s.context_natural_key, s.context_object_id)
            s.children = [] // remove node children
            res.push(s) //append node
            if(c.length > 0)
            {
                if(c[0].position > 0) //if node has more children
                {
                    res.push(new StatusCommentLoader(s.id, c[0].position, false, s.level))
                }
                res = res.concat(this.flattenData(c))
                if(c[c.length -1].position < s.comments - 1)
                {
                    res.push(new StatusCommentLoader(s.id, c[c.length -1].position, true, s.level))
                }
            }
            if(nullOrUndefined( s.parent ) && s.permission >= Permission.post)
                res.push(this.createStatusComposer(s))
        })
        return res
    }
    loadStatuses = () =>
    {
        const { items } = this.state
        const offset = items.filter(o => {
            if(o.hasOwnProperty('id'))
            {
                return !(o as Status).parent
            }
            return false
        }).length
        const { limit, contextNaturalKey, contextObjectId } = this.props
        ApiClient.newsfeedV2(limit,offset,contextNaturalKey, contextObjectId, null, this.props.defaultChildrenLimit, this.props.filter, this.props.includeSubContext, null, (data, status, error) => {
            if(!this._mounted)
                return
            if(data && data.results)
            {
                let newData = this.flattenData( data.results )
                this.setState({
                    items: offset == 0 || this.state.isRefreshing ?  newData :  [...items, ...newData],
                    isRefreshing: false,
                    hasMore:data.next != null,
                    isLoading:false,
                    hasLoaded:true
                });
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    handleRefresh = () =>
    {
        if(this.state.isLoading || this.hasContextError(this.props))
        { // cancel current
            return
        }
        this.setState({
            isRefreshing: true,
            isLoading: true
        }, this.loadStatuses);
    }
    getClonedStatusCommentsLoader = (loader:StatusCommentLoader) => {

        return new StatusCommentLoader(loader.statusId, loader.position, loader.loadNewer, loader.level)
    }
    getClonedStatusComposer = (composer:StatusComposer) => {
        const comp = new StatusComposer(composer.statusId,composer.communityId, composer.contextObjectId, composer.contextNaturalKey, composer.level, composer.content)
        comp.composerRef = composer.composerRef
        comp.composerFocus = composer.composerFocus
        comp.forceUpdate = composer.forceUpdate
        composer.composerRef = null
        return comp
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
        stateItems[i] = newStatus
        const cb = newStatus.highlightMode ? () => {
            this.scheduleHighlightRemoval(newStatus)
        } : undefined
        this.setState(() => {
            return {items:stateItems}
        }, cb)
        return newStatus
    }
    handleDeleteAttribute(id:number, status:Status) {
        ApiClient.deleteStatusAttribute(id, (data, st, error) => {
            if(!this._mounted)
                return
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
            ToastManager.showRequestErrorToast(error)
        })
    }
    handleCreateAttribute(status:Status, type:ObjectAttributeType, user?:number, completion?:(success:boolean) => void )
    {
        ApiClient.createStatusAttribute(status.id, type, user, (data, st, error) => {
            if(!this._mounted)
                return
            if(data)
            {
                const clone = this.getClonedStatus(status)
                clone.serialization_date = new Date().toISOString()
                const attrs = clone.attributes || []
                attrs.push(data)
                this.updateStatusItem(clone)
            }
            ToastManager.showRequestErrorToast(error)
            completion && completion(!!data)
        })
    }
    handleReaction(reaction:string, status:Status)
    {
        const clone = this.getClonedStatus(status)
        clone.serialization_date = new Date().toISOString()
        let index = this.findIndexByStatusId(clone.id)
        let me = this.props.authenticatedProfile
        let oldReaction = StatusUtilities.getStatusReaction(clone, me.id)
        let rCount = clone.reaction_count
        let r = clone.reactions || {}
        let userId = me.id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        clone.reactions = data.reactions
        clone.reaction_count = data.reactionsCount
        this.updateStatusItem(clone, index, false)
        //console.log("handleReaction", clone.reactions)
        ApiClient.reactToStatus(clone.id, reaction, (data, statusCode, error) => {
            if(!this._mounted)
                return
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                this.updateStatusItem(status) // setting old status
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    handleLoadMore = () =>
    {
        if(!this.state.hasMore || this.state.isLoading || this.hasContextError(this.props))
        {
            return
        }
        this.setState({
            isLoading: true
        }, this.loadStatuses);
    }
    renderLoading = () => {
        if (this.state.isLoading || this.props.isResolvingContext) {
            return (<LoadingSpinner key="loading"/>)
        }
        return null
    }
    updateItems = (updated:ArrayItem[], completion?:() => void) => {
        this.setState(prevState => {
            let items = prevState.items
            updated.forEach(u => items[u.index] = u.object)
            items = items.filter(i => !!i)
            return ({
                items: items,
              })
        }, completion)
    }
    insertObject = (object:FeedListItem, index:number, completion?:() => void) => {
        this.setState(prevState => {
            const items = prevState.items
            items.splice(index,0,object)
            return ({
                items: items,
              })
        }, completion)
    }
    insertObjects = (objects:FeedListItem[], index:number, completion?:() => void) => {
        this.setState(prevState => {
            const items = prevState.items
            items.splice(index,0,...objects)
            return ({
                items: items,
              })
        },completion)
    }
    removeObjectAtIndex = (index:number, completion?:() => void) => {
        this.setState(prevState => {
            const items = prevState.items
            items.splice(index,1)
            return ({
                items: items,
              })
        },completion)
    }
    removeObjectsAtIndexes = (indexes:number[], completion?:() => void) => {
        const arr = indexes.sort((a, b) => b - a) //descending
        this.setState(prevState => {
            const items = prevState.items
            arr.forEach(i => {
                delete items[i]
            })
            return ({
                items: items.filter(i => !nullOrUndefined(i)),
              })
        },completion)
    }
    //after status deleted ok, update current data structure
    postDeleteStatus = (update:IncomingUpdateItem) => {

        const canUpdatePositions = !nullOrUndefined(update.position)
        if(!canUpdatePositions)
            return // wait for server delete
        console.log("<<START>>")
        let updateArray:ArrayItem[] = []
        let parentStatus = update.parent_id && this.findStatusByStatusId(update.parent_id)
        const deletedStatus = this.findStatusByStatusId(update.id)
        if(!parentStatus && !deletedStatus)
        {
            console.log("No parent status or deleted status, aborting!")
            return
        }
        const parentIndex = this.findIndexByStatusId(update.parent_id)
        const deletedStatusIndex = this.findIndexByStatusId(update.id)
        const deletedStatusLevel = deletedStatus ? deletedStatus.level : parentStatus.level + 1
        let currentIndex = parentStatus ? parentIndex : deletedStatusIndex
        if(parentStatus)
        {
            const oldCount = parentStatus.comments
            parentStatus = this.getClonedStatus(parentStatus)
            parentStatus.comments -= 1
            updateArray.push({index:parentIndex, object:parentStatus})
            console.log(`Adjusting Status(${parentStatus.id}) comments from ${oldCount} to ${parentStatus.comments}`)
            //start looping forward
            currentIndex += 1
        }
        if(currentIndex > -1)
        {
            let insideDeleteScope = false
            const parentTopCommentLoaderIndex = this.findStatusCommentLoaderByStatusId(update.parent_id, false)
            if(parentTopCommentLoaderIndex > -1)
            {
                const c = this.state.items[parentTopCommentLoaderIndex] as StatusCommentLoader
                const clone = this.getClonedStatusCommentsLoader(c)
                clone.position = clone.position - 1
                const deleteCommentLoader = clone.position == 0
                updateArray.push({index:parentTopCommentLoaderIndex, object:deleteCommentLoader ? null : clone})
                console.log(`${deleteCommentLoader? "Deleting" : "Adjusting"} parent top comment loader(${c.statusId}) position from ${c.position} to ${clone.position}`)
            }
            while(currentIndex > -1)
            {
                const item = this.state.items[currentIndex]
                if(!item || item.level < deletedStatusLevel) // outside array or item is outside scope
                {
                    if(item instanceof StatusCommentLoader)
                    {
                        if(item.statusId == update.parent_id) // skip parent comment loaders
                        {
                            currentIndex += 1
                            continue
                        }
                    }
                    break
                }
                if(item.level == deletedStatusLevel )//siblings
                {
                    if(item.hasOwnProperty('id'))
                    {
                        const c = item as Status
                        insideDeleteScope = c.id == update.id
                        if(c.position > update.position)//update position
                        {
                            const clone = {...c}
                            clone.position = clone.position - 1
                            updateArray.push({index:currentIndex, object:clone})
                            console.log(`Adjusting Status(${c.id}) position from ${c.position} to ${clone.position}`)
                        }
                    }
                    else if(item instanceof StatusCommentLoader)
                    {
                        const c = item as StatusCommentLoader
                        if(c.statusId == update.id)
                        {
                            updateArray.push({index:currentIndex, object:null})
                        }
                        else if(parentStatus && c.statusId == parentStatus.id)
                        {
                            if(c.position > update.position)
                            {
                                const clone = this.getClonedStatusCommentsLoader(c)
                                clone.position = clone.position - 1
                                const shouldRemove = clone.position == 0
                                updateArray.push({index:currentIndex, object:shouldRemove ? null : clone})
                                console.log(`Adjusting comment loader(${c.statusId}) position from ${c.position} to ${clone.position}`)
                            }
                        }
                    }
                    else if (item instanceof StatusComposer)
                    {
                        const c = item as StatusComposer
                        if(c.statusId == update.id) // remove composers belonging to deleted status
                        {
                            updateArray.push({index:currentIndex, object:null})
                        }
                    }
                }
                if(insideDeleteScope)
                {
                    //delete everything below deleted status level
                    updateArray.push({index:currentIndex, object:null})
                }
                currentIndex += 1
            }
            //adjust parent bottom comment loader
            const parentBottomCommentLoaderIndex = this.findStatusCommentLoaderByStatusId(update.parent_id, true)
            if(parentBottomCommentLoaderIndex > -1)
            {
                const c = this.state.items[parentBottomCommentLoaderIndex] as StatusCommentLoader
                if(c.position == update.position)//delete if same pos
                {
                    const clone = this.getClonedStatusCommentsLoader(c)
                    clone.position = clone.position - 1
                    updateArray.push({index:parentBottomCommentLoaderIndex, object:clone})
                    console.log(`Adjusting parent bottom comment loader(${c.statusId}) position from ${c.position} to ${clone.position}`)
                }
                else if(parentStatus && update.position > c.position && c.position == parentStatus.comments - 1) // if delete below and there is no more
                {
                    updateArray.push({index:parentBottomCommentLoaderIndex, object:null})
                    console.log(`Deleting parent bottom comment loader(${c.statusId})`)
                }
                /*else if(c.position > update.position)//update position
                {
                    //updateArray.push({index:parentBottomCommentLoaderIndex, object:null})
                    //console.log(`Deleting parent bottom comment loader(${c.statusId})`)
                    const clone = this.getClonedStatusCommentsLoader(c)
                    clone.position = clone.position - 1
                    updateArray.push({index:parentBottomCommentLoaderIndex, object:clone})
                    console.log(`Adjusting parent bottom comment loader(${c.statusId}) position from ${c.position} to ${clone.position}`)
                }*/
            }
        }
        console.log("<<END>>", updateArray)
        if(updateArray.length > 0)
            this.updateItems(updateArray)
    }
    deleteStatus = (status:Status) => {
        console.log("deleteStatus", status.id)
        this.setStashUpdates(true)
        ApiClient.deleteStatus(status.id, (data, st, error) => {
            if(!this._mounted)
                return
            if(nullOrUndefined(error))
            {
                this.postDeleteStatus({id:status.id, parent_id:status.parent, type:EventStreamMessageType.STATUS_DELETED})
            }
            ToastManager.showRequestErrorToast(error)
            this.setStashUpdates(false)
        })
    }
    updateStatus = (statusId:number, status:Status, files?:UploadedFile[], completion?:(success:boolean) => void) => {
        ApiClient.updateStatus(status, (data, reqStatus, error) => {
            if(!this._mounted)
                return
            if(data)
            {
                this.updateStatusItem(data)
            }
            if(completion)
            {
                completion(data && !error)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    createNewStatus = (message:string, files?:UploadedFile[], completion?:(success:boolean) => void) => {
        if(!this.props.contextNaturalKey || !this.props.contextObjectId)
            return
        const tempStatus = StatusUtilities.getStatusPreview(this.props.contextNaturalKey, this.props.contextObjectId, message, files)
        this.insertObject(tempStatus,0)
        this.setStashUpdates(true)
        ApiClient.createStatus(tempStatus, (newStatus, requestStatus, error) => {
            if(!this._mounted)
                return
            const success = !!newStatus
            if(success)
            {
                const newStatusIndex = this.findIndexByStatusId(tempStatus.id)
                //newStatus.temporary = true
                const updateArray:ArrayItem[] = []
                updateArray.push({index:newStatusIndex, object:newStatus})
                this.updateItems(updateArray)
                if(newStatus.permission >= Permission.post)
                {
                    const composer = this.createStatusComposer(newStatus)
                    this.insertObject(composer, newStatusIndex + 1)
                }
            }
            completion && completion(success)
            ToastManager.showRequestErrorToast(error)
            this.setStashUpdates(false)
        })
    }
    scheduleHighlightRemoval = (status:Status) => {
        setTimeout(() => {
            const clone:Status = {...status, highlightMode:undefined}
            const index = this.findIndexByStatusId(clone.id)
            if(index > -1)
                this.updateItems([{index:index, object:clone}])
        }, 1000)
    }
    insertOrUpdateComment = (comment:Status, tempId?:number, completion?:() => void) => {
        //comment.temporary = true
        comment.highlightMode = true
        const onCompleted = () => {
            this.scheduleHighlightRemoval(comment)
            completion && completion()
        }
        const parent = this.findStatusByStatusId(comment.parent)
        const oldCommentIndex = this.findIndexByStatusId(comment.id)
        const tempIndex = tempId ? this.findIndexByStatusId(tempId) : -1
        const updateArray:ArrayItem[] = []
        let onUpdateCompleted:() => void = onCompleted
        if(!parent)
        {
            //ignore
            return
        }
        const updateParent = () => {
            let updatedParent = this.getClonedStatus(parent)
            updatedParent.comments += 1
            let updatedParentIndex = this.findIndexByStatusId(parent.id)
            updateArray.push({index:updatedParentIndex, object:updatedParent})
        }
        //tempid && !old
        if(tempIndex > -1 && oldCommentIndex == -1) // update parent
        {
            updateArray.push({index:tempIndex, object:comment})
            updateParent()
        }
        //!tempid && old
        else if(tempIndex == -1 && oldCommentIndex > -1)
        {
            updateArray.push({index:oldCommentIndex, object:comment})
        }
        //tempid && old
        else if(tempIndex > -1 && oldCommentIndex > -1)
        {
            updateArray.push({index:oldCommentIndex, object:comment})
            onUpdateCompleted = () => {
                this.removeObjectsAtIndexes([tempIndex], onCompleted)
            }
        }
        //!tempid && !old
        else // update parent
        {
            let insertIndex = -1
            insertIndex = this.findStatusComposerIndexByStatusId(comment.parent)
            if(insertIndex == -1)
            {
                // find last index of object that has same parent
                insertIndex = this.findCommentBottomInsertIndexByStatusId(comment.parent)
                if(insertIndex > -1)
                    insertIndex += 1
                else
                {
                    // if not found, insert after parent
                    insertIndex = this.findIndexByStatusId(comment.parent)
                    if(insertIndex > -1)
                        insertIndex += 1
                }
            }
            this.insertObject(comment, insertIndex)
            updateParent()
        }
        this.updateItems(updateArray, onUpdateCompleted)
    }
    createNewComment = (parent:Status, message:string, files?:UploadedFile[], completion?:(success:boolean) => void) => {
        const tempStatus = StatusUtilities.getCommentPreview(parent, message, files)
        let composerIndex = this.findStatusComposerIndexByStatusId(parent.id)
        if(composerIndex > -1 )
        {
            this.insertObject(tempStatus, composerIndex)
            this.setStashUpdates(true)
            ApiClient.createStatus(tempStatus, (newObject, responseStatusCode, error) => {
                if(!this._mounted)
                    return
                const success = !nullOrUndefined(newObject)
                if(success)
                {
                    const removeComposer = () => {

                        const composerIndex = this.findStatusComposerIndexByStatusId(parent.id)
                        this.removeObjectAtIndex(composerIndex)
                    }
                    const removeFunc = newObject.level == 2 ? removeComposer : undefined
                    this.insertOrUpdateComment(newObject, tempStatus.id, removeFunc)

                }
                if(completion)
                    completion(success)
                ToastManager.showRequestErrorToast(error)
                this.setStashUpdates(false)
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
    navigateToContextObject = (context:ContextObject) => {
        NavigationUtilities.navigateToUrl(this.props.history, context.uri)
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
                if(status.context_object)
                {
                    this.navigateToContextObject(status.context_object)
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
                if(extra && (extra.message || extra.files))
                {
                    this.createNewComment(status, extra.message, extra.files, extra.completion)
                }
                else
                {
                    logWarn()
                }
                break;
            }
            case StatusActions.edit:
            {
                if(extra && (extra.status || extra.files))
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
            case StatusActions.showCommentReply:
            {
                let parent = status
                let content:string = undefined
                if(status.level > 1)
                {
                    parent = this.findStatusByStatusId(status.parent)
                    content = "@" + Mention.getMentionString(ContextNaturalKey.USER, status.owner.id, userFullName(status.owner)) + " "
                }
                this.insertCommentComposer(parent, content)
                break;
            }
            default:logWarn()
        }
    }
    setComposerFocus = (statusId:number) => () => {
        const composerIndex = this.findStatusComposerIndexByStatusId(statusId)
        if(composerIndex > -1)
        {
            const composer = this.state.items[composerIndex] as StatusComposer
            if(composer && composer.composerRef)
            {
                composer.composerFocus()
            }
        }
    }
    insertCommentComposer = (status:Status, content?:string) => {
        if(status.permission < Permission.post)
            return // show error?
        const composerIndex = this.findStatusComposerIndexByStatusId(status.id)
        if(composerIndex == -1)
        {
            const composer = this.createStatusComposer(status)
            composer.content = content
            let index = -1
            if(status.comments == 0)
                index = this.findIndexByStatusId(status.id)
            else
                index = this.findCommentBottomInsertIndexByStatusId(status.id)
            if(index > -1)
                this.insertObject(composer, index + 1, this.setComposerFocus(status.id))
        }
        else {
            const composer = this.getClonedStatusComposer( this.state.items[composerIndex] as StatusComposer )
            composer.content = content
            composer.forceUpdate = uniqueId()
            this.updateItems([{index:composerIndex, object:composer}], this.setComposerFocus(status.id))
        }
    }
    createStatusComposer = (status:Status) => {

        return new StatusComposer(status.id, status.community && status.community.id, status.context_object_id , status.context_natural_key, status.level)
    }
    navigateToActionWithId = (statusId:number) => (action:StatusActions, extra?:any, completion?:(success:boolean) => void) =>
    {
        let index = this.findIndexByStatusId(statusId)
        let status = this.state.items[index] as Status
        this.navigateToAction(status, action, extra, completion)
    }
    renderStatus = (authUser:UserProfile, item:Status, isComment:boolean, index:number, color:string, isLast:boolean) =>
    {
        const isHighlighted = !!this.props.highlightStatusId && item.id == this.props.highlightStatusId
        const ref = isHighlighted && this.highlightRef || undefined
        const cn = classnames(color, {"last":isLast})
        let observerRegister = undefined;
        if (!this.props.authenticatedProfile.is_anonymous){
            observerRegister = (item.temporary || item.read || this.readObserver && this.readObserver.getReads().contains(item.id)) ? undefined : this.registerObservee(item.id)
        }
        return <StatusComponent
                    innerRef={observerRegister}
                    ref={ref}
                    isHighlighted={isHighlighted}
                    canUpload={true}
                    addLinkToContext={true}
                    key={"status_" + item.id}
                    status={item}
                    bottomOptionsEnabled={true}
                    authorizedUserId={authUser.id}
                    isComment={isComment}
                    onActionPress={this.navigateToActionWithId(item.id)}
                    className={cn}
                />
    }
    renderStatusComposer = (composer:StatusComposer, index:number, color:string) => {
        const cn = classnames(color, "lvl" + composer.level)
            return (
                <StatusComposerComponent
                    key={"statuscomposer_" + composer.statusId}
                    ref={composer.composerRef}
                    canUpload={true}
                    canMention={true}
                    canComment={true}
                    className={cn}
                    content={composer.content}
                    forceUpdate={composer.forceUpdate}
                    onActionPress={this.navigateToActionWithId(composer.statusId)}
                    contextNaturalKey={composer.contextNaturalKey}
                    contextObjectId={composer.contextObjectId}
                    communityId={composer.communityId}
                    focusEnd={f => composer.composerFocus = f}
                    taggableMembers={this.getStatusTaggableMembers(composer.statusId)}
                    useAdaptiveFontSize={false}
                />
            )
    }
    statusLoaderKey = (loader: StatusCommentLoader) => {
        return loader.statusId + "_" + loader.loadNewer
    }
    renderCommentLoader =  (loader: StatusCommentLoader, index:number, color:string) =>
    {
        const key = this.statusLoaderKey(loader)
        const isLoading = this.state.activeCommentLoaders[key] != undefined
        const cn = classnames(color, "lvl" + loader.level, "sid-" + loader.statusId + "_p_" + (loader.position || 0))
        return <CommentLoader
                    key={"statusloader_" + key}
                    className={cn}
                    isLoading={isLoading}
                    loadNewer={loader.loadNewer}
                    loadMoreComments={this.loadMoreComments(loader)}/>
    }
    getStatusTaggableMembers = (statusId:number) => {
        const status = this.findStatusByStatusId(statusId)
        let visibility = status && status.visibility || []
        if(visibility.length > 0)
            return visibility
        visibility = ContextNaturalKey.getMembers(this.props.contextNaturalKey, this.props.contextObject)
        if(visibility.length > 0)
            return visibility
        return ProfileManager.getContactListIds(true)
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
    findCommentIndexesByStatusId = (statusId:number) =>
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
    findCommentsByStatusId = (statusId:number) =>
    {
        const result:Status[] = []
        this.state.items.forEach( (o, i) => {
            if(o.hasOwnProperty('id'))
            {
                const s = (o as Status)
                if(s.parent == statusId)
                {
                    result.push(s)
                }
            }
        })
        return result
    }
    findCommentBottomInsertIndexByStatusId = (statusId:number) => {
        const items = this.state.items
        let foundIndex = -1
        for (let index = 0; index < items.length; index++) {
            const o = items[index]
            if(o.hasOwnProperty('id'))
            {
                if((o as Status).parent == statusId)
                {
                    foundIndex = index
                }
            }
            else if(o instanceof StatusCommentLoader)
            {
                const scl = (o as StatusCommentLoader)
                if(scl.statusId == statusId)
                {
                    foundIndex = index
                }
            }
            else if (foundIndex > -1) // if has visited children done
            {
                return foundIndex
            }
        }
        return foundIndex
    }
    findStatusComposerIndexByStatusId = (statusId:number) =>
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
    findStatusCommentLoaderByStatusId = (statusId:number, loadNewer:boolean) =>
    {
        return this.state.items.findIndex( o => {
            if(o instanceof StatusCommentLoader)
            {
                const scl = (o as StatusCommentLoader)
                return scl.statusId == statusId && scl.loadNewer == loadNewer
            }
            return false
        })
    }
    didLoadMoreComments = (loader:StatusCommentLoader, comments:Status[]) =>
    {
        const loaderKey = this.statusLoaderKey(loader)
        if(comments.length == 0)
        {
            this.setState( (prevState) => {
                const currentLoaders = {...prevState.activeCommentLoaders}
                delete currentLoaders[loaderKey]
                return {
                    activeCommentLoaders:currentLoaders
                    }
            })
            return
        }
        var commentLoaderIndex = this.findStatusCommentLoaderByStatusId(loader.statusId, loader.loadNewer)
        const newData = this.flattenData(comments)
        this.setState(prevState => {
            const currentLoaders = {...prevState.activeCommentLoaders}
            delete currentLoaders[loaderKey]
            const items = [...prevState.items]
            const currentStatus = this.findStatusByStatusId(loader.statusId)
            const commentCount = currentStatus.comments

            //remove old comment loader
            items.splice(commentLoaderIndex, 1)
            if(loader.loadNewer)
            {
                const lastCommentPosition = comments[comments.length - 1].position
                const currentComments = this.findCommentsByStatusId(loader.statusId)
                const hasNextPosition = !!currentComments.find(c => c.position == lastCommentPosition + 1)
                if(!hasNextPosition && lastCommentPosition < commentCount - 1)
                {
                    newData.push(new StatusCommentLoader(loader.statusId, lastCommentPosition, loader.loadNewer, loader.level))
                }
            }
            else {
                const firstCommentPosition = comments[0].position
                if(firstCommentPosition > 0)
                {
                    newData.unshift(new StatusCommentLoader(loader.statusId, firstCommentPosition, loader.loadNewer, loader.level))
                }
            }
            items.splice(commentLoaderIndex, 0,...newData)
            return ({
                items: items,
                activeCommentLoaders:currentLoaders
                })
        })
        console.log("didLoadMoreComments")
    }
    applyContextToStatuses = (statuses:Status[], contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        statuses.forEach(s => {
            if(!s.context_natural_key || s.context_object_id)
            {
                s.context_natural_key = contextNaturalKey
                s.context_object_id = contextObjectId
            }
        })
        return statuses
    }
    _loadComments = (loader:StatusCommentLoader) =>
    {
        let offset:number = 0
        let requestingCount:number = 0
        if(loader.loadNewer)
        {
            const currentStatus = this.findStatusByStatusId(loader.statusId)
            const commentCount = currentStatus.comments
            const currentComments = this.findCommentsByStatusId(loader.statusId)
            let index = currentComments.findIndex(c => c.position == loader.position)
            if(index == -1)
            {
                console.error("Comment not found")
                index = loader.position
            }
            let rest = commentCount - (loader.position + 1)
            if(currentComments.length > index + 1)
            {
                const nextPosition = currentComments[index + 1].position
                if(nextPosition)
                    rest = nextPosition - loader.position - 1
            }
            requestingCount = Math.min(this.props.childrenLimit, rest)
            offset = loader.position + 1
        }
        else {
            const rest = loader.position
            requestingCount = Math.min(this.props.childrenLimit, rest)
            offset = Math.max(0, rest - requestingCount)
        }
        //console.log("loadItems comments", "limit:" + requestingCount, "offset:"+offset)
        ApiClient.statusComments(loader.statusId, offset, requestingCount, false, (data, status, error) => {
            if(!this._mounted)
                return
            if(data && data.results)
            {
                const parent = this.findStatusByStatusId(loader.statusId)
                const comments = this.applyContextToStatuses(data.results, parent.context_natural_key, parent.context_object_id)
                this.didLoadMoreComments(loader, comments)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    loadMoreComments = (loader:StatusCommentLoader) => (e:any) =>
    {
        const loaderKey = this.statusLoaderKey(loader)
        console.log("loadMoreFromLoader", loaderKey, loader.toString())
        let currentLoaders = this.state.activeCommentLoaders
        currentLoaders[loaderKey] = loader
        this.setState({activeCommentLoaders:currentLoaders}, () => {this._loadComments(loader)})

    }
    getNextColor = () => {
        return null
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
            const {contextObject, filter} = this.props
            if (filter) {
                return <div className="module-content-empty">{translate("newsfeed.module.empty")}</div>
            } else if (contextObject && contextObject.permission >= Permission.post) {
                return (
                    <div className="module-content-empty">{translate("newsfeed.module.empty")}
                        <div className="subtext">{translate("newsfeed.module.nothing.posted")}</div>
                    </div>
                )
            } else {
                return <div className="module-content-empty">{translate("newsfeed.module.empty")}</div>
            }
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
        const cn = classnames("status-list vertical-scroll")//, "rb-" + ResponsiveBreakpoint[breakpoint])
        return(
            <div className="newsfeed-component">
                <List ref={this.listRef}
                    enableAnimation={false}
                    onScroll={scroll}
                    className={cn}>
                        {this.state.items.map((s, i) => {
                            if(s instanceof StatusComposer)
                            {
                                const comp = this.renderStatusComposer(s, i, color)
                                color = this.getNextColor()
                                return comp
                            }
                            else if(s instanceof StatusCommentLoader)
                            {
                                return this.renderCommentLoader(s, i, color)
                            }
                            const isComment = !!s.parent
                            const next = this.state.items[i + 1]
                            let isLast = true
                            if(next)
                            {
                                isLast = !(next instanceof StatusComposer || next instanceof StatusCommentLoader) && !next.parent
                            }
                            return this.renderStatus(authUser, s, isComment, i, color, isLast)
                        }).concat(this.renderLoading()) }
                        {this.renderEmpty()}
                        {this.renderError()}
                    </List>

            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps =>
{
    return {
        authenticatedProfile:state.authentication.profile,
    }
}
const mergeProps = (stateProps, dispatchProps, ownProps) =>
{
    return {...ownProps, ...stateProps}
}
export default withRouter(connect(mapStateToProps, undefined, mergeProps, { forwardRef:true })(NewsfeedComponent))
