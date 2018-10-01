import * as React from 'react';
import * as moment from "moment";
import Moment from "react-moment";
import { FormattedDate, FormattedTime} from "react-intl";
import { userFullName, nullOrUndefined } from '../../../utilities/Utilities';
import ReactButton from "./ReactButton";
import StatusOptions from "./StatusOptions";
import StatusContent from "./StatusContent";
import { translate } from '../../intl/AutoIntlProvider';
import { Status } from '../../../reducers/statuses';
import { UserProfile } from '../../../reducers/profileStore';
import { UploadedFile } from '../../../reducers/conversations';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import ApiClient from '../../../network/ApiClient';
import { ProfileManager } from '../../../main/managers/ProfileManager';
import ReactionStats from './ReactionStats';
import { Avatar } from '../Avatar';
import { Link } from 'react-router-dom';
import { Routes } from '../../../utilities/Routes';
require("./Comment.scss");
let timezone = moment.tz.guess();
export interface Props 
{
    comment:Status
    onCommentDelete:(comment:Status) => void
    onCommentEdit:(comment:Status, files:UploadedFile[]) => void
    isOwner:boolean
    canReact:boolean 
    canMention:boolean
    canUpload:boolean
    canComment:boolean
    communityId:number
}
interface State 
{
    reactions:{[id:string]:number[]}
    reactionsCount:number
    reaction:string
}
export default class Comment extends React.Component<Props, State>  {
    constructor(props:Props) {
        super(props);

        this.state = {
            reaction:StatusUtilities.getReaction(props.comment, ProfileManager.getAuthenticatedUser()),
            reactionsCount: props.comment.reaction_count,
            reactions:props.comment.reactions || {}
        };

        // Auto-binding
        this.handleReaction = this.handleReaction.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) {
        return nextProps.comment != this.props.comment && nextProps.comment.updated_at != this.props.comment.updated_at || nextState.reaction != this.state.reaction;
    }

    componentWillReceiveProps(nextProps:Props) {
        this.setState({
            reaction:StatusUtilities.getReaction(nextProps.comment, ProfileManager.getAuthenticatedUser()),
            reactionsCount: nextProps.comment.reaction_count,
            reactions:nextProps.comment.reactions || {}
        });
    }

    handleReaction(reaction:string) {
        let oldReaction = this.state.reaction
        let userId = ProfileManager.getAuthenticatedUser().id
        let {reactions, reactionsCount} = StatusUtilities.applyReaction(oldReaction, reaction, this.state.reactions, this.state.reactionsCount, userId)
        this.setState({ reactions: reactions, reactionsCount: reactionsCount, reaction: reaction}, () => {
            ApiClient.reactToStatus(this.props.comment.id, reaction, (data, status, error) => {  
                if(!nullOrUndefined( error ))
                {
                    console.log("error sending reaction:", error)
                    let {reactions, reactionsCount} = StatusUtilities.applyReaction(reaction, oldReaction, this.state.reactions, this.state.reactionsCount, userId)
                    this.setState({ reactions: reactions, reactionsCount: reactionsCount, reaction: oldReaction})
                }
            })
        })
    }

    handleDelete() {
        this.props.onCommentDelete(this.props.comment);
    }

    render() {
        let comment = this.props.comment
        let cl = "comment" + (comment.pending ? " temp" : "")
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
                    reaction={StatusUtilities.getReaction(comment, ProfileManager.getAuthenticatedUser())}
                    reactionsCount={this.state.reactionsCount}
                    reactions={comment.reactions}
                    onReaction={this.handleReaction}
                    onCommentDelete={this.handleDelete}
                    onCommentEdit={this.props.onCommentEdit}
                    isOwner={this.props.isOwner}
                    owner={comment.owner}
                    status={comment} canReact={this.props.canReact} canMention={this.props.canMention}/>
            </li>
        );
    }
}
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
                <span className="edited-at">
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
                <div className="col-12 info-comment">
                    <Avatar image={photoSrc} />
                    <p className="name">
                        <Link className="user" to={Routes.PROFILES + this.props.owner.slug_name}>{fullName}</Link>
                        <br />
                        <span className="date">{this.getTimestamp()}</span>
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
class CommentFooter extends React.Component<CommentFooterProps,{}> {
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
            <div className="row footer-stats">
                <div className="col-7">
                {this.props.canReact &&
                    <span className="like-wrapper">
                    {this.renderReactButton()}

                        <ReactionStats reactions={this.props.reactions}
                                   reactionsCount={this.props.reactionsCount}/>
                    </span>
                }
                </div>

                <div className="col-5 text-right">
                    {this.renderOptionsButton()}
                </div>
            </div>
        )
    }
}