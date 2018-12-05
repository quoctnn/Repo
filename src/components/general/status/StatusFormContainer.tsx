import * as React from 'react';
import { Settings } from '../../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../../utilities/Utilities';
import { Mention } from '../../input/MentionEditor';
import ApiClient from '../../../network/ApiClient';
import { IEditorComponent, EditorContent } from '../ChatMessageComposer';
import { TempStatus, UploadedFile, Status } from '../../../types/intrasocial_types';
import { RootState } from '../../../reducers';
import { NestedPageItem } from '../../../utilities/PaginationUtilities';
import { connect } from 'react-redux';
import * as Actions from '../../../actions/Actions';
import { CommentForm } from './CommentForm';
import classNames = require('classnames');
require("./StatusFormContainer.scss");


interface OwnProps 
{
    pageItem:NestedPageItem
    onCommentSubmit?:(comment:TempStatus, files:UploadedFile[]) => void
    onStatusSubmit?:(status:TempStatus, files:UploadedFile[]) => void
    contextNaturalKey?:string
    contextObjectId?:number
    canMention:boolean
    canComment:boolean
    canUpload:boolean
    className?:string
}
interface ReduxStateProps
{
    parentStatus:Status
}
interface ReduxDispatchProps{}
interface State 
{
    text: string,
    files_ids: number[],
    files: UploadedFile[],
    uploading: boolean,
    link: string,
    mentions: number[]
    renderPlaceholder:boolean
}
export type Props = ReduxStateProps & OwnProps
class StatusFormContainer extends React.Component<Props, State> {  

    formRef = React.createRef<IEditorComponent & any>();
    element = React.createRef<HTMLDivElement>()
    observer:IntersectionObserver = null
    constructor(props) {
        super(props)

        this.state = {
            text: '',
            files_ids: [],
            files: [],
            uploading: false,
            link: null,
            mentions: [],
            renderPlaceholder:true
        };

        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearStatusState = this.clearStatusState.bind(this);
        this.canPost = this.canPost.bind(this);
        this.getFilesCount = this.getFilesCount.bind(this);
        this.handleMentions = this.handleMentions.bind(this);
        this.handleFileQueueComplete = this.handleFileQueueComplete.bind(this);
        this.handleFileAdded = this.handleFileAdded.bind(this);
        this.handleFileRemoved = this.handleFileRemoved.bind(this);
        this.handleFileUploaded = this.handleFileUploaded.bind(this);
        this.handleFileError = this.handleFileError.bind(this);
        this.findPrimaryLink = this.findPrimaryLink.bind(this);
        this.clearEditor = this.clearEditor.bind(this);
        this.handleMentionSearch = this.handleMentionSearch.bind(this);
        this.onDidType = this.onDidType.bind(this);
    }
    componentDidMount() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const { isIntersecting } = entry;
              if (isIntersecting) 
              {
                this.setState({renderPlaceholder:false})
                this.observer.disconnect();
              }
            });
        },
        {
          root: document.querySelector(".status-list"),
          rootMargin: "0px 0px 200px 0px"
        });
        this.observer.observe(this.element.current);
        
        //this.setState({renderPlaceholder:false})
    }
    handleMentionSearch(search:string, completion:(mentions:Mention[]) => void)
    {
        if(this.props.pageItem.community)
        {
            console.log("searching", search)
            ApiClient.getCommunityMembers(this.props.pageItem.community, (data, status, error) => {
                completion(data.map(u => Mention.fromUser(u)))
            })
        }
    }
    handleTextChange(text) {
        this.setState({text: text})
    }

    handleSubmit() {
        let content = this.getContent()
        this.setState({text:content.text, mentions: content.mentions}, () => {
            if (!this.canPost()) {
                return;
            }
    
            let text = this.state.text.trim();
            let link = this.findPrimaryLink();
    
            var status = {
                text: text,
                privacy: "members",
                files_ids: this.state.files_ids,
                link: link,
                context_natural_key: this.props.contextNaturalKey,
                context_object_id: this.props.contextObjectId,
                parent: this.props.pageItem.id,
                mentions: this.state.mentions
            };
    
            // Send callback depending on type of status.
            // Statuses with a parent node are comments.
            if (status.parent && status.parent > 0) {
                // Comment must have same context as parent:
                status.context_natural_key = this.props.parentStatus.context_natural_key;
                status.context_object_id = this.props.parentStatus.context_object_id;
    
                this.props.onCommentSubmit(status, this.state.files);
            } else {
                if(!status.context_natural_key || !status.context_object_id)
                {
                    throw new Error("contextNaturalKey and/or contextObjectId are missing");
                }
                this.props.onStatusSubmit(status, this.state.files);
            }
    
            this.clearStatusState()
            this.clearEditor()
        })
        
    }

    clearEditor() {
        this.formRef.current.clearEditorContent()
    }
    getContent():EditorContent {
        return this.formRef.current.getContent()
    }

    clearStatusState() {
        this.setState({
            text: '',
            files_ids: [],
            files: [],
            link: null,
            mentions: []
        });
    }
    findPrimaryLink() {
        // Return first url found in text if any.
        // We are using two regex (with and without http://)
        var pattern = new RegExp(URL_REGEX.source, "im");
        var pattern2 = new RegExp(URL_WWW_REGEX.source, "im");
        var result = this.state.text.match(pattern)
        var result2 = this.state.text.match(pattern2)

        if (result != null && result2 != null) {
            // Bot regex match, return the first found
            return (result.index > result2.index) ? result2[0] : result[0]
        } else {
            if (result != null) return result[0]
            if (result2 != null) return result2[0]
            return null
        }
    }
    onDidType(unprocessedText:string)
    {
        this.setState({text: unprocessedText})
    }
    canPost() 
    {
        let text = this.state.text.trim()

        if (this.state.uploading || text.length > Settings.commentMaxLength) {
            return false;
        }

        return (text != null && text.length > 0) || this.getFilesCount() > 0
    }

    getFilesCount() {
        return this.state.files_ids.length
    }

    handleMentions(mentions) {
        this.setState({mentions: mentions})
    }

    handleFileQueueComplete = () => 
    {
        this.setState({uploading: false});
    }

    handleFileAdded() {
        this.setState({uploading: true});
    }

    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }

    handleFileRemoved(file) {
        if (typeof file !== 'undefined' && file != null) {
            let files_ids = this.removeFileIdFromList(file, this.state.files_ids)
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files, files_ids: files_ids});
        }
    }

    removeFileFromList = (file, fileList:UploadedFile[]) => 
    {
        let list = fileList.map(f => f)
        let index = list.findIndex((item) => {
            return item.id == file.id;
        });
        if(index >= 0)
        {
            list.splice(index, 1)
            return list
        }
        return list
    }

    removeFileIdFromList = (file, fileIdList:number[]) => 
    {
        let list = fileIdList.map(f => f)
        let index = list.indexOf(file.id)
        if(index >= 0)
        {
            list.splice(index, 1)
            return list
        }
        return list
    }

    handleFileUploaded = (file) => {
        let files = this.state.files.map(f => f)
        files.push(file)
        let files_ids = this.state.files_ids.map(f => f)
        files_ids.push(file.id)
        this.setState({files: files, files_ids: files_ids})
    }
    render() 
    {
        if(this.state.renderPlaceholder)
        {
            let itemClass = classNames("chat-message-composer chat-message-composer-placeholder secondary-text", this.props.className)
            return <div ref={this.element} className={itemClass}></div>
        }
        if ((this.props.canComment && this.props.parentStatus.can_comment) || false) {
            const canPost = this.canPost()
            return (
                <CommentForm
                    onFileError={this.handleFileError}
                    mentionSearch={this.handleMentionSearch}
                    ref={this.formRef}
                    onDidType={this.onDidType}
                    communityId={this.props.pageItem.community}
                    canUpload={this.props.canUpload}
                    //onTextChange={this.handleTextChange}
                    canPost={canPost}
                    onSubmit={this.handleSubmit}
                    onFileAdded={this.handleFileAdded}
                    onFileRemoved={this.handleFileRemoved}
                    onFileUploaded={this.handleFileUploaded}
                    onFileQueueComplete={this.handleFileQueueComplete}
                    onChangeMentions={this.handleMentions}
                    canMention={this.props.canMention}
                    parentStatus={this.props.parentStatus}
                    className={this.props.className}
                    />
            );
        } else {
            return null;
        }
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        parentStatus:ownProps.pageItem.isTemporary ? state.queue.statusMessages.find(i => i.id == ownProps.pageItem.id) : state.statuses.items[ownProps.pageItem.id]
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {

        setStatusReaction:(status:Status, reactions:{ [id: string]: number[] },reaction_count:number) => {
            dispatch(Actions.setStatusReactions(status, reactions, reaction_count));
        }
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(StatusFormContainer);