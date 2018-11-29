import * as React from 'react';
import classnames from 'classnames';
import Comment from './Comment';
import { translate } from '../../intl/AutoIntlProvider';
import { Status } from '../../../reducers/statuses';
import { UploadedFile } from '../../../reducers/conversations';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';

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
    maxComments:number 
}
interface State 
{
    showAll:boolean

}
type Props = OwnProps & DefaultProps
export default class CommentList extends React.Component<Props, State> {

    private listRef = React.createRef<HTMLUListElement>()
    static defaultProps:DefaultProps = 
    {
        maxComments:3
    }
    constructor(props) {
        super(props);
        this.state = {showAll: false};

        // Auto-binding
        this.handlePrevious = this.handlePrevious.bind(this);
        this.renderPreviousLink = this.renderPreviousLink.bind(this);
        this.scrollListToBottom = this.scrollListToBottom.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.data != this.props.data ||
            nextState.showAll != this.state.showAll
        );
    }

    componentDidUpdate(prevProps:Props, prevState) {
        let userClickedShowAll = !prevState.showAll && this.state.showAll;
        let userCommentedShowingAll = this.state.showAll && prevProps.data.length < this.props.data.length;

        if (userClickedShowAll || userCommentedShowingAll) {
            this.scrollListToBottom();
        }
    }

    scrollListToBottom() {
        this.listRef.current.scrollTop = this.listRef.current.scrollHeight;
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
        let data = this.props.data;

        if (data && !this.state.showAll && data.length > this.props.maxComments) {
            return (
                <button className="btn btn-link link-text" onClick={this.handlePrevious}>
                    <i className="fa fa-arrow-down"/> &nbsp;
                    {translate("Show previous")}
                </button>
            )
        }
    }

    render() {
        let data = this.props.data
        let max = (this.state.showAll) ? data.length : this.props.maxComments;
        let min = ((data.length - max) >= 0) ? data.length - max : 0;
        let items = data.map(r => r).reverse().slice(min, data.length)
        let listClass = classnames('comment-list', {scrollable: this.state.showAll});
        return (
            <ul className={listClass} ref={this.listRef}>
                <li className="text-center">{this.renderPreviousLink()}</li>
                {items.map((comment, i) => {
                    return this.renderComment(comment, items.length - 1 == i ? "last": null);
                })}
            </ul>
        );
    }
}