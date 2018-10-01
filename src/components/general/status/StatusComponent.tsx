import * as React from 'react';
import classNames from "classnames";
import { Status } from '../../../reducers/statuses';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import StatusHeader from './StatusHeader';
import StatusContent from './StatusContent';
import ApiClient from '../../../network/ApiClient';
import { UploadedFile } from '../../../reducers/conversations';
import { ProfileManager } from '../../../main/managers/ProfileManager';
import StatusFooter from './StatusFooter';
import { nullOrUndefined } from '../../../utilities/Utilities';
require("./StatusComponent.scss");

export interface Props 
{
    status:Status
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
    isOwner:boolean
}
interface State 
{
    reactions:{[id:string]:number[]}
    reactionsCount:number
    reaction:string
}
export default class StatusComponent extends React.Component<Props, State> {     
    constructor(props) {
        super(props);
        this.state = {
            reactions:props.status.reactions || {},
            reactionsCount:props.status.reaction_count,
            reaction:StatusUtilities.getReaction(props.status, ProfileManager.getAuthenticatedUser())
        }
        this.handleReaction = this.handleReaction.bind(this)
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) 
    {
        let ret = nextProps.status.id != this.props.status.id || 
                    nextProps.status.children.length != this.props.status.children.length || 
                    nextProps.status.updated_at != this.props.status.updated_at || 
                    nextProps.status.serialization_date != this.props.status.serialization_date || 
                    nextState.reaction != this.state.reaction  || 
                    nextProps.status.highlights !== this.props.status.highlights 

        //console.log("id:" + this.props.status.id, ret)
        return ret
    }
    componentWillReceiveProps(nextProps:Props) {
        let status = nextProps.status
        this.setState({
            reaction:StatusUtilities.getReaction(status, ProfileManager.getAuthenticatedUser()),
            reactionsCount: status.reaction_count,
            reactions: status.reactions || {}
        });
    }
    getTypeOfContent(status:Status)
    {
        let videos = StatusUtilities.filterStatusFileType(status, "video")
        let photos = StatusUtilities.filterStatusFileType(status, "image")
        let attachments = StatusUtilities.filterStatusFileType(status, "document")
        let audios = StatusUtilities.filterStatusFileType(status, "audio")

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
        let oldReaction = this.state.reaction
        let userId = ProfileManager.getAuthenticatedUser().id
        let {reactions, reactionsCount} = StatusUtilities.applyReaction(oldReaction, reaction, this.state.reactions, this.state.reactionsCount, userId)
        this.setState({ reactions: reactions, reactionsCount: reactionsCount, reaction: reaction}, () => {
            ApiClient.reactToStatus(this.props.status.id, reaction, (data, status, error) => {  
                if(!nullOrUndefined( error ))
                {
                    console.log("error sending reaction:", error)
                    let {reactions, reactionsCount} = StatusUtilities.applyReaction(reaction, oldReaction, this.state.reactions, this.state.reactionsCount, userId)
                    this.setState({ reactions: reactions, reactionsCount: reactionsCount, reaction: oldReaction})
                }
            })
        })
    }
    render()
    {
        let status = this.props.status
        let communityId = status.community && status.community.id ? status.community.id : null
        let statusId = "status" + status.id
        let statusType = this.getTypeOfContent(status)
        let itemClass = classNames("status status-component", statusType) + (status.pending ? " temp" : "")
        let cl = status.created_at ? "panel item-panel" : "panel item-panel temp"
        return (<div className={itemClass} id={statusId}>
                    <hr className="line"/>
                    <StatusHeader
                        owner={status.owner}
                        created_at={status.created_at}
                        edited_at={status.edited_at}
                        status={status} addLinkToContext={this.props.addLinkToContext} 
                        contextKey={this.props.contextKey} 
                        contextId={this.props.contextId}/>

                    <StatusContent status={status} embedLinks={true}/>

                    <StatusFooter
                        communityId={communityId}
                        bottomOptionsEnabled={this.props.bottomOptionsEnabled}
                        onCommentSubmit={this.props.onCommentSubmit}
                        onStatusDelete={this.props.onStatusDelete}
                        onCommentDelete={this.props.onCommentDelete}
                        onCommentEdit={this.props.onCommentEdit}
                        onStatusEdit={this.props.onStatusEdit}
                        commentsCount={status.comments_count}
                        created_at={status.created_at}
                        onReact={this.handleReaction}
                        reaction={this.state.reaction}
                        reactions={this.state.reactions}
                        reactionsCount={this.state.reactionsCount}
                        children={this.props.status.children}
                        status={status}
                        canMention={this.props.canMention}
                        canComment={this.props.canComment}
                        canUpload={this.props.canUpload}
                        canReact={this.props.canReact} 
                        isOwner={this.props.isOwner}/>
                </div>)
    }
}