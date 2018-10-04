import * as React from 'react';
import { Status } from '../../../reducers/statuses';
import CommentList from './CommentList';
import StatusFooterStats from './StatusFooterStats';
import { UploadedFile } from '../../../reducers/conversations';
import CommentFormContainer from './CommentFormContainer';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
require("./StatusFooter.scss");

export interface Props 
{
    bottomOptionsEnabled:boolean
    commentsCount:number 
    created_at:string 
    onReact:(reaction: string) => void
    reactions:{[id:string]:number[]}
    reactionsCount:number
    reaction:string
    onStatusDelete:(removeId: number) => void
    onStatusEdit:(status: Status, files: UploadedFile[]) => void
    onCommentEdit:(comment: Status, files: UploadedFile[]) => void
    onCommentDelete:(comment: Status) => void
    status:Status
    onCommentSubmit:(comment: Status, files: UploadedFile[]) => void
    canMention:boolean
    children:NestedPageItem[]
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    isOwner:boolean
    communityId:number
    authorizedUserId:number
}
interface State 
{
}
export default class StatusFooter extends React.Component<Props, State> {     
    constructor(props) {
        super(props)
        // Auto-binding
        this.renderStats = this.renderStats.bind(this)
        this.renderCommentList = this.renderCommentList.bind(this)
        this.renderCommentForm = this.renderCommentForm.bind(this)
    }

    renderStats() {
        if (this.props.bottomOptionsEnabled) {
            return (
                <StatusFooterStats
                    communityId={this.props.communityId}
                    canUpload={this.props.canUpload}
                    commentsCount={this.props.commentsCount}
                    created_at={this.props.created_at}
                    onReact={this.props.onReact}
                    reaction={this.props.reaction}
                    reactions={this.props.reactions}
                    reactionsCount={this.props.reactionsCount}
                    onStatusDelete={this.props.onStatusDelete}
                    onStatusEdit={this.props.onStatusEdit}
                    onCommentEdit={this.props.onCommentEdit}
                    owner={this.props.status.owner}
                    isOwner={this.props.isOwner}
                    status={this.props.status} 
                    canComment={this.props.canComment} canReact={this.props.canReact} canMention={this.props.canMention} />
            )
        }
    }

    renderCommentList() {
        return (
            <CommentList authorizedUserId={this.props.authorizedUserId} canComment={this.props.canComment} communityId={this.props.communityId} canUpload={this.props.canUpload} data={this.props.children} canReact={this.props.canReact}
                         onCommentEdit={this.props.onCommentEdit}
                         onCommentDelete={this.props.onCommentDelete} canMention={this.props.canMention}/>
        )
    }

    renderCommentForm() {
        return (
            <CommentFormContainer
                communityId={this.props.communityId}
                canUpload={this.props.canUpload}
                parentStatus={this.props.status}
                canMention={this.props.canMention}
                canComment={this.props.canComment}
                onCommentSubmit={this.props.onCommentSubmit} 
                />
        )
    }


    render() {
        return (
            <div className="panel-footer item-panel-footer">
                {this.renderStats()}
                {this.renderCommentList()}
                {this.renderCommentForm()}
            </div>
        );
    }
}

