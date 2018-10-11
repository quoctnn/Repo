import * as React from 'react';
import ReactButton from './ReactButton';
import { UserProfile } from '../../../reducers/profileStore';
import StatusOptions from './StatusOptions';
import { Status } from '../../../reducers/statuses';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import ReactionStats from './ReactionStats';
import { UploadedFile } from '../../../reducers/conversations';
require("./StatusFooterStats.scss");

export interface Props 
{
    commentsCount:number
    created_at:string
    onReact:(reaction:string) => void
    reaction:string
    reactionsCount:number
    reactions:{[id:string]:number[]}
    onStatusDelete:(removeId: number) => void
    onStatusEdit:(status: Status, files: UploadedFile[]) => void
    onCommentEdit:(comment: Status, files: UploadedFile[]) => void
    owner:UserProfile
    status:Status
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    canMention:boolean
    isOwner:boolean
    communityId:number
}
interface State 
{
}
export default class StatusFooterStats extends React.Component<Props, State> {     
    constructor(props) {
        super(props)
        // Auto-binding
        this.renderLikeButton = this.renderLikeButton.bind(this)
        this.renderOptionsButton = this.renderOptionsButton.bind(this)
    }

    renderLikeButton() {
        if (this.props.created_at != null) {
            return (
                <ReactButton reaction={this.props.reaction}
                onReact={this.props.onReact}/>
            )
        }
    }

    renderOptionsButton() {
        return (
            <StatusOptions communityId={this.props.communityId} canUpload={this.props.canUpload} onDelete={this.props.onStatusDelete}
                           onSaveEdit={this.props.onStatusEdit}
                           status={this.props.status} canComment={this.props.canComment} isOwner={this.props.isOwner} canMention={this.props.canMention}/>
        )
    }

    render() {
        return (
            <div className="row status-footer-stats secondary-text">
                <div className="col-7">
                    {this.props.canReact && 
                        <span className="reaction-wrapper">
                            {this.renderLikeButton()}

                            <ReactionStats reactions={this.props.reactions}
                                reactionsCount={this.props.reactionsCount}/>
                        </span>
                    }
                    {!this.props.canComment && 
                        <a className="btn-options direct-link" href={StatusUtilities.getPermaLink(this.props.status.id)} target="_blank">
                            <i className="fa fa-chevron-circle-right"></i>
                        </a>
                    }

                    {/* Check if status is a task comment to display comment icon */}
                    { this.props.canComment &&
                        <span>
                            <i className="far fa-comment"></i><span className="comment-count">{this.props.commentsCount}</span>
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
