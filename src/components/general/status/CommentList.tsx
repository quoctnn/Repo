import * as React from 'react';
import Comment from './Comment';
import { translate } from '../../intl/AutoIntlProvider';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { Status, UploadedFile } from '../../../types/intrasocial_types';

export interface OwnProps
{
    authorizedUserId:number
    data:NestedPageItem[]
    onCommentEdit:(comment: Status, files: UploadedFile[]) => void
    onCommentDelete:(comment: Status) => void
    canReact:boolean
    canComment:boolean
    canMention:boolean
    canUpload:boolean
    communityId:number
}
export interface DefaultProps
{
}
interface State 
{
}
type Props = OwnProps & DefaultProps
export default class CommentList extends React.Component<Props, State> {

    static defaultProps:DefaultProps = 
    {
    }
    constructor(props) {
        super(props);
        this.state = {showAll: false};

        // Auto-binding
        this.handlePrevious = this.handlePrevious.bind(this);
        this.renderPreviousLink = this.renderPreviousLink.bind(this);
    }

    shouldComponentUpdate(nextProps:Props, nextState:State) {
        return (
            nextProps.data != this.props.data
        );
    }

    renderComment(pageItem:NestedPageItem, className) {
        return (
            <Comment
                className={className}
                communityId={this.props.communityId}
                canUpload={this.props.canUpload}
                canReact={this.props.canReact}
                canComment={this.props.canComment}
                canMention={this.props.canMention}
                authorizedUserId={this.props.authorizedUserId}
                key={pageItem.id}
                pageItem={pageItem}
                onCommentEdit={this.props.onCommentEdit}
                onCommentDelete={this.props.onCommentDelete}>
            </Comment>
        );
    }

    handlePrevious(e) {
        e.preventDefault();
        this.setState({showAll: true});
    }

    renderPreviousLink() {
        if (false) {
            return (
                <button className="btn btn-link link-text" onClick={this.handlePrevious}>
                    <i className="fa fa-arrow-down"/> &nbsp;
                    {translate("Show previous")}
                </button>
            )
        }
        return null
    }

    render() {
        let items = this.props.data
        return (
            <ul className="comment-list">
                <li className="text-center">{this.renderPreviousLink()}</li>
                {items.map((comment, i) => {
                    return this.renderComment(comment, items.length - 1 == i ? "last": null);
                })}
            </ul>
        );
    }
}