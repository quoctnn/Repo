import * as React from 'react';
import StatusFooterStats from './StatusFooterStats';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { Status, UploadedFile } from '../../../types/intrasocial_types';
import { StatusActions } from './StatusComponent';
require("./StatusFooter.scss");

export interface Props 
{
    bottomOptionsEnabled:boolean
    commentsCount:number 
    created_at:string 
    onActionPress:(action:StatusActions, extra?:Object) => void
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
    }
    renderStats = () => 
    {
        if (this.props.bottomOptionsEnabled) {
            return (
                <StatusFooterStats
                    communityId={this.props.communityId}
                    canUpload={this.props.canUpload}
                    commentsCount={this.props.commentsCount}
                    created_at={this.props.created_at}
                    onReact={this.props.onActionPress}
                    reaction={this.props.reaction}
                    reactions={this.props.reactions}
                    reactionsCount={this.props.reactionsCount}
                    onStatusDelete={this.props.onStatusDelete}
                    onStatusEdit={this.props.onStatusEdit}
                    onCommentEdit={this.props.onCommentEdit}
                    owner={this.props.status.owner}
                    isOwner={this.props.isOwner}
                    status={this.props.status} 
                    canComment={this.props.canComment} canReact={this.props.canReact} canMention={this.props.canMention} 
                    isComment={this.props.status.parent != null}/>
            )
        }
    }
    render() {
        return (
            <div className="panel-footer status-footer">
                {this.renderStats()}
            </div>
        );
    }
}

