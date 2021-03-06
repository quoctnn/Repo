import * as React from 'react';
import ReactButton from './ReactButton';
import StatusOptions from './StatusOptions';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import ReactionStats from './ReactionStats';
import { Status, UploadedFile, UserProfile } from '../../../types/intrasocial_types2';
import { StatusActions } from './StatusComponent';
require("./StatusFooterStats.scss");

export interface Props 
{
    commentsCount:number
    created_at:string
    onActionPress:(action:StatusActions, extra?:Object) => void
    reaction:string
    reactionsCount:number
    reactions:{[id:string]:number[]}
    owner:UserProfile
    status:Status
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    canMention:boolean
    isOwner:boolean
    communityId:number
    isComment:boolean
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
                onActionPress={this.props.onActionPress}/>
            )
        }
    }

    renderOptionsButton() {
        return (
            <StatusOptions communityId={this.props.communityId} 
                canUpload={this.props.canUpload} 
                onActionPress={this.props.onActionPress}
                status={this.props.status} 
                canComment={this.props.canComment} 
                isOwner={this.props.isOwner} 
                canMention={this.props.canMention}/>
        )
    }

    render() 
    {
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
                    { this.props.canComment && !this.props.isComment &&
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
