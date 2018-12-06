import * as React from 'react';
import classNames from "classnames";
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import StatusHeader from './StatusHeader';
import StatusContent from './StatusContent';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import { Status, UploadedFile } from '../../../types/intrasocial_types';
import StatusFooterStats from './StatusFooterStats';
require("./StatusComponent.scss");
export enum StatusActions
{
    /**Navigates to the context of the current status (context_natural_key and context_object_id), i.e "group.group" or "core.community" ... and the the corresponding object id */
    context = 0,
    /**Navigates to the community of the current status: extra:{} */
    community = 1,
    /**Navigates to User profile for the current status or the profile in extra field: extra:{profile?:UserProfile} */
    user = 3,
    /**Navigates to a browser component that loads the "link": extra:{link:string} */
    link = 4,
    /**Sends a reaction to the server: extra:{reaction:string|null} */
    react = 5,
    /**Creates a new comment: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    new = 6,
    /**Edits a status: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    edit = 7,
    /** NOOP extra:{} */
    delete = 8,
    /** NOOP extra:{} */
    reactionsCount = 9,
    /** NOOP extra:{} */
    file = 10,
}
export interface OwnProps 
{
    onActionPress:(action:StatusActions, extra?:Object) => void
    bottomOptionsEnabled:boolean
    addLinkToContext:boolean
    contextKey?:string
    contextId?:number
    canMention:boolean
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    authorizedUserId:number
    status:Status
    className?:string
    isLastComment:boolean
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
        const nextStatus = nextProps.status
        const status = this.props.status
        let ret = nextState.renderPlaceholder != this.state.renderPlaceholder || nextStatus.id != status.id || 
        nextStatus.updated_at != status.updated_at || 
        nextStatus.serialization_date != status.serialization_date ||
        nextStatus.reaction_count != status.reaction_count || 
        nextProps.isLastComment != this.props.isLastComment
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
    render()
    {
        let status = this.props.status
        const isComment = status.parent != null
        if(this.state.renderPlaceholder)
        {
            let itemClass = classNames("status-placeholder drop-shadow", this.props.className, { statuscomment: isComment, temp: status.pending, last:this.props.isLastComment})
            return <div ref={this.element} className={itemClass}></div>
        }
        let communityId = status.community && status.community.id ? status.community.id : null
        let statusId = "status" + status.id
        let statusType = this.getTypeOfContent(status)
        let itemClass = classNames("status status-component drop-shadow", statusType, this.props.className, { statuscomment: isComment, temp: status.pending, last:this.props.isLastComment})
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
                    reaction={StatusUtilities.getStatusReaction(status, AuthenticationManager.getAuthenticatedUser())}
                    reactions={status.reactions}
                    reactionsCount={status.reaction_count}
                    owner={status.owner}
                    isOwner={status.owner.id == this.props.authorizedUserId}
                    status={status} 
                    canComment={this.props.canComment} 
                    canReact={this.props.canReact} 
                    canMention={this.props.canMention} 
                    isComment={isComment}
                    onActionPress={this.props.onActionPress}
                    />
                </div>)
    }
}