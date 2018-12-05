import * as React from 'react';
import classNames from "classnames";
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import StatusHeader from './StatusHeader';
import StatusContent from './StatusContent';
import ApiClient from '../../../network/ApiClient';
import { nullOrUndefined } from '../../../utilities/Utilities';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import { Status, UploadedFile } from '../../../types/intrasocial_types';
import StatusFooterStats from './StatusFooterStats';
import { StatusManager } from '../../../managers/StatusManager';
require("./StatusComponent.scss");

export interface OwnProps 
{
    bottomOptionsEnabled:boolean
    addLinkToContext:boolean
    contextKey?:string
    contextId?:number
    canMention:boolean
    onStatusEdit:(status:Status, files:UploadedFile[]) => void
    onCommentEdit:(comment:Status, files:UploadedFile[]) => void
    onCommentDelete:(comment:Status) => void
    onStatusDelete:(removeId:number) => void
    onCommentSubmit:(comment:Status, files:UploadedFile[]) => void
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    authorizedUserId:number
    pageItem:NestedPageItem
    className?:string
}
interface State 
{
    renderPlaceholder:boolean
}
type Props = OwnProps 
export default class StatusComponent extends React.Component<Props, State> 
{
    
    element = React.createRef<HTMLDivElement>()
    observer:IntersectionObserver = null


    constructor(props) {
        super(props);
        this.state = {
            renderPlaceholder:true
        }
        this.handleReaction = this.handleReaction.bind(this)
    }
    componentDidMount() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const { isIntersecting } = entry;
              if (isIntersecting) 
              {
                this.setState({renderPlaceholder:false})
                this.observer.disconnect();
              }
            });
        },
        {
          root: document.querySelector(".status-list"),
          rootMargin: "0px 0px 200px 0px"
        });
        this.observer.observe(this.element.current);
        
        //this.setState({renderPlaceholder:false})
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) 
    {
        const nextStatus = nextProps.pageItem.status
        const status = this.props.pageItem.status
        let ret = nextState.renderPlaceholder != this.state.renderPlaceholder || nextStatus.id != status.id || 
        nextStatus.updated_at != status.updated_at || 
        nextStatus.serialization_date != status.serialization_date ||
        nextStatus.reaction_count != status.reaction_count //|| 
        //nextStatus.reactions != status.reactions
        //console.log("status id:" + status.id, ret,(status.children_ids || []).length, (nextStatus.children_ids|| []).length, )
        return ret
    }
    getTypeOfContent(status:Status)
    {
        let videos = StatusUtilities.filterStatusFileType(status.files, "video")
        let photos = StatusUtilities.filterStatusFileType(status.files, "image")
        let attachments = StatusUtilities.filterStatusFileType(status.files, "document")
        let audios = StatusUtilities.filterStatusFileType(status.files, "audio")

        if (videos.length && !photos.length && !audios.length && !attachments.length) {
            return "videos"
        } else if (photos.length && !videos.length && !audios.length && !attachments.length) {
            return "photos"
        } else if (audios.length && !photos.length && !videos.length && !attachments.length) {
            return "audios"
        } else if (attachments.length && !audios.length && !photos.length && !videos.length) {
            return "attachments"
        } else if (attachments.length || audios.length || photos.length || videos.length) {
            return "multimedia"
        } else if (status.link) {
            return "links"
        } else if (status.context_natural_key == "event.event") {
            return "event" // TODO: remove if not used again
        }
        return "text";
    }
    handleReaction(reaction:string) {

        const status = this.props.pageItem.status
        let oldReaction = StatusUtilities.getStatusReaction(status, AuthenticationManager.getAuthenticatedUser())
        let rCount = status.reaction_count
        let r = status.reactions || {}
        let userId = AuthenticationManager.getAuthenticatedUser().id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        StatusManager.setStatusReaction(status, data.reactions, data.reactionsCount)
        ApiClient.reactToStatus(status.id, reaction, (data, status, error) => {  
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                const st = this.props.pageItem.status
                let {reactions, reactionsCount} = StatusUtilities.applyReaction(reaction, oldReaction, data.reactions, data.reactionsCount, userId)
                StatusManager.setStatusReaction(st, reactions, reactionsCount)
            }
        })
    }
    render()
    {
        let status = this.props.pageItem.status
        const isComment = status.parent != null
        if(this.state.renderPlaceholder)
        {
            let itemClass = classNames("status-placeholder drop-shadow", this.props.className, { statuscomment: isComment, temp: status.pending})
            return <div ref={this.element} className={itemClass}></div>
        }
        let communityId = status.community && status.community.id ? status.community.id : null
        let statusId = "status" + status.id
        let statusType = this.getTypeOfContent(status)
        let itemClass = classNames("status status-component drop-shadow", statusType, this.props.className, { statuscomment: isComment, temp: status.pending})
        const addLinkToContext = !isComment && this.props.addLinkToContext
        return (<div className={itemClass} id={statusId}>
                    <hr className="line"/>
                    <StatusHeader
                        owner={status.owner}
                        created_at={status.created_at}
                        edited_at={status.edited_at}
                        status={status} 
                        addLinkToContext={addLinkToContext} 
                        contextKey={this.props.contextKey} 
                        contextId={this.props.contextId} isComment={isComment}/>

                    <StatusContent status={status} embedLinks={true}/>
                    <StatusFooterStats
                    communityId={communityId}
                    canUpload={this.props.canUpload}
                    commentsCount={status.comments_count}
                    created_at={status.created_at}
                    onReact={this.handleReaction}
                    reaction={StatusUtilities.getStatusReaction(status, AuthenticationManager.getAuthenticatedUser())}
                    reactions={status.reactions}
                    reactionsCount={status.reaction_count}
                    onStatusDelete={this.props.onStatusDelete}
                    onStatusEdit={this.props.onStatusEdit}
                    onCommentEdit={this.props.onCommentEdit}
                    owner={status.owner}
                    isOwner={status.owner.id == this.props.authorizedUserId}
                    status={status} 
                    canComment={this.props.canComment} 
                    canReact={this.props.canReact} 
                    canMention={this.props.canMention} 
                    isComment={isComment}
                    />
                </div>)
    }
}