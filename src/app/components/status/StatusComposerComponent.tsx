import * as React from "react";
import { StatusActions, UploadedFile, ContextNaturalKey } from "../../types/intrasocial_types";
import classnames from 'classnames';
import { Settings } from '../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../utilities/Utilities';
import { Mention } from "../general/input/MentionEditor";
import { IEditorComponent, EditorContent } from "../general/input/ChatMessageComposer";
import { CommentForm } from "./CommentForm";


import "./StatusComposerComponent.scss"
import { ProfileManager } from "../../managers/ProfileManager";

type OwnProps =
{
    onActionPress:(action:StatusActions, extra?:Object, completion?:(success:boolean) => void) => void
    canMention:boolean
    canComment:boolean
    canUpload:boolean
    className?:string
    contextObjectId:number 
    contextNaturalKey:ContextNaturalKey
    communityId:number
    showEmojiPicker?:boolean
    showSubmitButton?:boolean
    placeholder?:string
    children?:React.ReactNode
    canPost?:() => boolean
    refresh?:string
    content?:string
    mentions?:Mention[]
    onDidType?:(unprocessedText:string) => void
    taggableMembers?:number[] | (() => number[])
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
    focusEnd?:(f:() => void) => void
    forceUpdate?:string
}
type DefaultProps = {

    renderPlaceholder:boolean
}
type State =
{
    text: string,
    files_ids: number[],
    files: UploadedFile[],
    uploading: boolean,
    link: string,
    mentions: number[]
    renderPlaceholder:boolean
}
type Props = OwnProps & DefaultProps
export class StatusComposerComponent extends React.Component<Props, State> {
    formRef = React.createRef<IEditorComponent & any>();
    element = React.createRef<HTMLDivElement>()
    observer:IntersectionObserver = null
    static defaultProps:DefaultProps = {
        renderPlaceholder:false,
    }
    constructor(props:Props) {
        super(props)

        this.state = {
            text: '',
            files_ids: [],
            files: [],
            uploading: false,
            link: null,
            mentions: [],
            renderPlaceholder:props.renderPlaceholder
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret = nextState.text != this.state.text ||
                nextProps.content != this.props.content ||
                !!nextProps.mentions && !this.props.mentions || 
                !nextProps.mentions && !!this.props.mentions || 
                nextProps.mentions && this.props.mentions && !nextProps.mentions.isEqual(this.props.mentions) || 
                nextState.uploading != this.state.uploading || 
                nextState.link != this.state.link || 
                !nextState.mentions.isEqual(this.state.mentions) || 
                !nextState.files_ids.isEqual(this.state.files_ids) || 
                nextState.renderPlaceholder != this.state.renderPlaceholder ||
                nextProps.className != this.props.className || 
                nextProps.refresh != this.props.refresh || 
                nextProps.showEmojiPicker != this.props.showEmojiPicker ||
                nextProps.showSubmitButton != this.props.showSubmitButton
        return ret;
    }
    componentDidMount = () => {
        if(this.state.renderPlaceholder)
        {
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
              //root: document.querySelector(".status-list"),
              rootMargin: "0px 0px 200px 0px"
            });
            this.observer.observe(this.element.current);
        }
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) => {
        if(!this.props.canMention)
        {
            completion([])
            return
        }
        console.log("searching", search)
        const {taggableMembers, contextNaturalKey, contextObjectId} = this.props
        ProfileManager.searchProfilesInContext({search, taggableMembers, contextNaturalKey, contextObjectId, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    handleTextChange = (text:string) => {
        this.setState({text: text})
    }

    handleSubmit = () => {
        let content = this.getContent()
        if(this.canPost()){
            this.setState({text:content.text, mentions: content.mentions}, () => {
                let text = this.state.text.trim();
                this.props.onActionPress(StatusActions.new, {message:text, mentions:this.state.mentions, files:this.state.files})
                this.clearStatusState()//maybe not here?
                this.clearEditor()//maybe not here?
            })
        }
        
        
    }

    clearEditor = () => {
        this.formRef.current.clearEditorContent()
    }
    getContent = ():EditorContent => {
        return this.formRef.current.getContent()
    }

    clearStatusState = () => {
        this.setState({
            text: '',
            files_ids: [],
            files: [],
            link: null,
            mentions: []
        }, this.canPost);
    }
    findPrimaryLink = () => {
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
    onDidType = (unprocessedText:string) => {
        const f = this.props.onDidType ? () => this.props.onDidType(unprocessedText) : undefined
        this.setState({text: unprocessedText}, f)
    }
    canPost = () => {
        let text = this.state.text.trim()
        if (this.state.uploading)
            return false
        if(text.length > Settings.commentMaxLength)
                return false
        if(this.props.canPost)
            return this.props.canPost()
        return (text != null && text.length > 0) || this.getFilesCount() > 0
    }

    getFilesCount = () => {
        return this.state.files_ids.length
    }

    handleMentions = (mentions:number[]) => {
        this.setState({mentions: mentions})
    }

    handleFileQueueComplete = () => 
    {
        this.setState({uploading: false});
    }

    handleFileAdded = () => {
        this.setState({uploading: true});
    }

    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }

    handleFileRemoved = (file:UploadedFile) => {
        if (typeof file !== 'undefined' && file != null) {
            let files_ids = this.removeFileIdFromList(file, this.state.files_ids)
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files, files_ids: files_ids});
        }
    }

    removeFileFromList = (file:UploadedFile, fileList:UploadedFile[]) => 
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

    removeFileIdFromList = (file:UploadedFile, fileIdList:number[]) => 
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

    handleFileUploaded = (file:UploadedFile) => {
        let files = this.state.files.map(f => f)
        files.push(file)
        let files_ids = this.state.files_ids.map(f => f)
        files_ids.push(file.id)
        this.setState({files: files, files_ids: files_ids})
    }
    render = () => {
        if(this.state.renderPlaceholder)
        {
            let itemClass = classnames("chat-message-composer chat-message-composer-placeholder secondary-text", this.props.className)
            return <div ref={this.element} className={itemClass}></div>
        }
        if (this.props.canComment) 
        {
            const canPost = this.canPost()
            return (
                <CommentForm
                    onFileError={this.handleFileError}
                    mentionSearch={this.handleMentionSearch}
                    ref={this.formRef}
                    onDidType={this.onDidType}
                    contextNaturalKey={this.props.contextNaturalKey}
                    contextObjectId={this.props.contextObjectId}
                    canUpload={this.props.canUpload}
                    canPost={canPost}
                    onSubmit={this.handleSubmit}
                    onFileAdded={this.handleFileAdded}
                    onFileRemoved={this.handleFileRemoved}
                    onFileUploaded={this.handleFileUploaded}
                    onFileQueueComplete={this.handleFileQueueComplete}
                    onChangeMentions={this.handleMentions}
                    className={this.props.className}
                    communityId={this.props.communityId}
                    showEmojiPicker={this.props.showEmojiPicker}
                    placeholder={this.props.placeholder}
                    onBlur={this.props.onBlur}
                    onFocus={this.props.onFocus}
                    showSubmitButton={this.props.showSubmitButton}
                    content={this.props.content}
                    mentions={this.props.mentions}
                    focusEnd={this.props.focusEnd}
                    forceUpdate={this.props.forceUpdate}
                    >
                    {this.props.children}
                    </CommentForm>
            );
        } else {
            return null;
        }
    }
}
