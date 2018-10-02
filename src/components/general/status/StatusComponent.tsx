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
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { connect } from 'react-redux'
import { RootState } from '../../../reducers/index';
import * as Actions from '../../../actions/Actions';
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
    pageItem:NestedPageItem
    authorizedUserId:number
}
interface ReduxStateProps
{
    status:Status
}
interface State 
{
}
interface ReduxDispatchProps
{
    setStatusReaction:(status:Status, reactions:{ [id: string]: number[] },reaction_count:number) => void
}
type Props = ReduxStateProps & OwnProps & ReduxDispatchProps
class StatusComponent extends React.Component<Props, State> {     
    constructor(props) {
        super(props);
        this.state = {
        }
        this.handleReaction = this.handleReaction.bind(this)
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) 
    {
        let ret = nextProps.status.id != this.props.status.id || 
                    nextProps.status.updated_at != this.props.status.updated_at || 
                    nextProps.status.serialization_date != this.props.status.serialization_date ||
                    nextProps.pageItem.children.length != this.props.pageItem.children.length ||
                    nextProps.status.reaction_count != this.props.status.reaction_count || 
                    nextProps.status.reactions != this.props.status.reactions
        console.log("status id:" + this.props.status.id, ret,(this.props.status.children_ids || []).length, (nextProps.status.children_ids|| []).length, )
        return ret
    }
   /*  componentWillReceiveProps(nextProps:Props) {
        let status = nextProps.status
        this.setState({
            reaction:StatusUtilities.getReaction(status, ProfileManager.getAuthenticatedUser()),
            reactionsCount: status.reaction_count,
            reactions: status.reactions || {}
        });
    } */
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
        let oldReaction = StatusUtilities.getReaction(this.props.status, ProfileManager.getAuthenticatedUser())
        let rCount = this.props.status.reaction_count
        let r = this.props.status.reactions || {}
        let userId = ProfileManager.getAuthenticatedUser().id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        this.props.setStatusReaction(this.props.status, data.reactions, data.reactionsCount)
        ApiClient.reactToStatus(this.props.status.id, reaction, (data, status, error) => {  
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                let {reactions, reactionsCount} = StatusUtilities.applyReaction(reaction, oldReaction, data.reactions, data.reactionsCount, userId)
                this.props.setStatusReaction(this.props.status, reactions, reactionsCount)
            }
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
                        authorizedUserId={this.props.authorizedUserId}
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
                        reaction={StatusUtilities.getReaction(this.props.status, ProfileManager.getAuthenticatedUser())}
                        reactions={this.props.status.reactions}
                        reactionsCount={this.props.status.reaction_count}
                        children={this.props.pageItem.children}
                        status={status}
                        isOwner={status.owner.id == this.props.authorizedUserId}
                        canMention={this.props.canMention}
                        canComment={this.props.canComment}
                        canUpload={this.props.canUpload}
                        canReact={this.props.canReact}/>
                </div>)
    }
}
const hasOwnPropsChanged = (nextProps:OwnProps, props:OwnProps) => 
{
    let ret = nextProps.pageItem.children.length != props.pageItem.children.length 
    return ret
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        status:ownProps.pageItem.isTemporary ? state.queue.statusMessages.find(i => i.id == ownProps.pageItem.id) : state.statuses.items[ownProps.pageItem.id]
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {

        setStatusReaction:(status:Status, reactions:{ [id: string]: number[] },reaction_count:number) => {
            dispatch(Actions.setStatusReactions(status, reactions, reaction_count));
        }
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps, null, {
    pure: true,
    areOwnPropsEqual: (next, prev) => {
      return !hasOwnPropsChanged(next, prev)
    },
  })(StatusComponent);