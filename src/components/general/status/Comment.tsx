import * as React from 'react';
import * as moment from "moment";
import Moment from "react-moment";
import { FormattedDate, FormattedTime} from "react-intl";
import { userFullName, nullOrUndefined } from '../../../utilities/Utilities';
import ReactButton from "./ReactButton";
import StatusOptions from "./StatusOptions";
import StatusContent from "./StatusContent";
import { translate } from '../../intl/AutoIntlProvider';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import ApiClient from '../../../network/ApiClient';
import ReactionStats from './ReactionStats';
import { Avatar } from '../Avatar';
import { Link } from 'react-router-dom';
import { Routes } from '../../../utilities/Routes';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { RootState } from '../../../reducers/index';
import { connect } from 'react-redux'
import * as Actions from '../../../actions/Actions';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import { Status, UploadedFile, UserProfile } from '../../../types/intrasocial_types';
require("./Comment.scss");
let timezone = moment.tz.guess();
export interface OwnProps 
{
    onCommentDelete:(comment:Status) => void
    onCommentEdit:(comment:Status, files:UploadedFile[]) => void
    canReact:boolean 
    canMention:boolean
    canUpload:boolean
    canComment:boolean
    communityId:number
    authorizedUserId:number
    pageItem:NestedPageItem
    className?:string
}
interface ReduxStateProps
{
    comment:Status
}
interface ReduxDispatchProps
{
    setStatusReaction:(status:Status, reactions:{ [id: string]: number[] },reaction_count:number) => void
}
interface State 
{
}
type Props = ReduxStateProps & OwnProps & ReduxDispatchProps
class Comment extends React.Component<Props, State>  {
    constructor(props:Props) {
        super(props);

        this.state = {
        };

        // Auto-binding
        this.handleReaction = this.handleReaction.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) {
        let ret =  nextProps.comment.id != this.props.comment.id || 
                nextProps.comment.updated_at != this.props.comment.updated_at || 
                nextProps.comment.serialization_date != this.props.comment.serialization_date ||
                nextProps.comment.reaction_count != this.props.comment.reaction_count || 
                nextProps.comment.reactions != this.props.comment.reactions
        console.log("comment id:" + this.props.comment.id, ret)
        return ret
    }

    handleReaction(reaction:string) {

        let oldReaction = StatusUtilities.getStatusReaction(this.props.comment, AuthenticationManager.getAuthenticatedUser())
        let rCount = this.props.comment.reaction_count
        let r = this.props.comment.reactions || {}
        let userId = AuthenticationManager.getAuthenticatedUser().id
        let data = StatusUtilities.applyReaction(oldReaction, reaction, r, rCount, userId)
        this.props.setStatusReaction(this.props.comment, data.reactions, data.reactionsCount)
        ApiClient.reactToStatus(this.props.comment.id, reaction, (data, status, error) => {  
            if(!nullOrUndefined( error ))
            {
                console.log("error sending reaction:", error)
                let {reactions, reactionsCount} = StatusUtilities.applyReaction(reaction, oldReaction, data.reactions, data.reactionsCount, userId)
                this.props.setStatusReaction(this.props.comment, reactions, reactionsCount)
            }
        })
    }

    handleDelete() {
        this.props.onCommentDelete(this.props.comment);
    }

    render() {
        let comment = this.props.comment
        let cl = "comment" + (comment.pending ? " temp" : "") + (this.props.className ? " " + this.props.className : "")
        return (
            <li className={cl}>
                <CommentHeader
                    owner={comment.owner}
                    created_at={comment.created_at}
                    edited_at={comment.edited_at}
                    />

                <StatusContent status={comment} embedLinks={false}/>

                <CommentFooter communityId={this.props.communityId}
                    canUpload={this.props.canUpload}
                    canComment={this.props.canComment}
                    commentsCount={comment.comments_count}
                    created_at={comment.created_at}
                    reaction={StatusUtilities.getStatusReaction(comment, AuthenticationManager.getAuthenticatedUser())}
                    reactionsCount={this.props.comment.reaction_count}
                    reactions={comment.reactions}
                    onReaction={this.handleReaction}
                    onCommentDelete={this.handleDelete}
                    onCommentEdit={this.props.onCommentEdit}
                    isOwner={this.props.comment.owner.id == this.props.authorizedUserId}
                    owner={comment.owner}
                    status={comment} canReact={this.props.canReact} canMention={this.props.canMention}/>
            </li>
        );
    }
}
const hasOwnPropsChanged = (nextProps:OwnProps, props:OwnProps) => 
{
    let ret = nextProps.pageItem.children.length != props.pageItem.children.length 
    return ret
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        comment:ownProps.pageItem.isTemporary ? state.queue.statusMessages.find(i => i.id == ownProps.pageItem.id) : state.statuses.items[ownProps.pageItem.id]
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
  })(Comment);
export interface CommentHeaderProps 
{
    owner:UserProfile
    created_at:string
    edited_at:string
}
class CommentHeader extends React.Component<CommentHeaderProps,{}> 
{
    shouldComponentUpdate(nextProps:CommentHeaderProps, nextState)
    {
        return nextProps.owner.id != this.props.owner.id || 
                nextProps.owner.updated_at != this.props.owner.updated_at
    }
    renderEditedAt(date) {
        if (date) {
            let time = moment.utc(date).tz(timezone).date()
            return (
                <span className="edited-at secondary-text">
                    {translate("edited")}{' '}
                    <FormattedDate value={time} />{' '}
                    <FormattedTime value={time} />
                </span>
            )
        }
    }

    getTimestamp() {
        // Get current date
        let current_date = new Date();
        // Add one minute to the current date to give some room for time inaccuracy
        let date = moment(current_date).add(1, 'm').toDate();
        // Date object for the post creation
        let created = new Date(this.props.created_at);
        if (isNaN(created.getTime())) {
            return translate("Publishing...")
        }
        else if (created <= date) {
            return <Moment interval={60000} fromNow date={created} />
        } else {
            return <Moment format='DD-MM-YYYY HH:mm' date={created} />
        }
    }

    render() {
        let fullName = userFullName(this.props.owner)
        let photoSrc = this.props.owner.avatar || this.props.owner.avatar_thumbnail
        return (
            <div className="row">
                <div className="col-12 status-header">
                    <Avatar image={photoSrc} />
                    <p className="name">
                        <Link className="user link-text" to={Routes.PROFILES + this.props.owner.slug_name}>{fullName}</Link>
                        <br />
                        <span className="date secondary-text">{this.getTimestamp()}</span>
                        {this.renderEditedAt(this.props.edited_at)}
                    </p>
                </div>
            </div>
        );
    }
}

export interface CommentFooterProps
{
    commentsCount:number
    created_at:string
    reactionsCount:number
    reaction:string
    reactions:{ [id: string]: number[] }
    onReaction:(reaction:string) => void
    onCommentDelete:() => void
    onCommentEdit:(comment:Status, files:UploadedFile[]) => void
    owner:UserProfile
    status:Status
    isOwner:boolean
    canReact:boolean
    canMention:boolean
    canUpload:boolean
    canComment:boolean
    communityId:number
}
class CommentFooter extends React.Component<CommentFooterProps,{}> 
{
    renderReactButton() {
        if (this.props.created_at !== null) {
            return (
                <ReactButton reaction={this.props.reaction}
                            onReact={this.props.onReaction}/>
            )
        }
    }

    renderOptionsButton() {
        return (
            <StatusOptions communityId={this.props.communityId} canUpload={this.props.canUpload} onDelete={this.props.onCommentDelete}
                           onSaveEdit={this.props.onCommentEdit}
                           status={this.props.status} canComment={this.props.canComment} isOwner={this.props.isOwner} canMention={this.props.canMention}/>
        )
    }

    render() {
        return (
            <div className="row status-footer-stats secondary-text">
                <div className="col-7">
                {this.props.canReact &&
                    <span className="reaction-wrapper">
                    {this.renderReactButton()}

                        <ReactionStats reactions={this.props.reactions}
                                   reactionsCount={this.props.reactionsCount}/>
                    </span>
                }
                </div>

                <div className="col-5 justify-content-end">
                    {this.renderOptionsButton()}
                </div>
            </div>
        )
    }
}