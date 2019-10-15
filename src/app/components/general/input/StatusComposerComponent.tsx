import * as React from "react";
import classnames from 'classnames';
import { StatusActions, ContextNaturalKey, UploadedFile } from "../../../types/intrasocial_types";
import { Mention } from "./MentionEditor";
import { ProfileManager } from "../../../managers/ProfileManager";
import { EditorContent, ChatMessageComposer } from "./ChatMessageComposer";
import { Settings } from "../../../utilities/Settings";
import "./StatusComposerComponent.scss"
import FilesUpload from "../../status/FilesUpload";
import { translate, lazyTranslate } from "../../../localization/AutoIntlProvider";
import {ApiClient} from "../../../network/ApiClient";
import { ToastManager } from "../../../managers/ToastManager";
import { uniqueId } from "../../../utilities/Utilities";

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
    onDidType?:(unprocessedText:string) => void
    taggableMembers?:number[] | (() => number[])
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
    focusEnd?:(f:() => void) => void
    forceUpdate?:string
    useAdaptiveFontSize?:boolean
}
type DefaultProps = {

    renderPlaceholder:boolean
    singleLine:boolean
    forceHideDropzone:boolean
}
type State =
{
    text: string,
    uploading: boolean,
    link: string,
    mentions: number[]
    renderPlaceholder:boolean
    showDropzone: boolean
    files:UploadedFile[]
    messageComposerReloadKey?:string
}
type Props = OwnProps & DefaultProps
export class StatusComposerComponent extends React.Component<Props, State> {
    formRef = React.createRef<ChatMessageComposer>();
    element = React.createRef<HTMLDivElement>()
    observer:IntersectionObserver = null
    static defaultProps:DefaultProps = {
        renderPlaceholder:false,
        singleLine:false,
        forceHideDropzone:false
    }
    constructor(props:Props) {
        super(props)

        this.state = {
            text: '',
            uploading: false,
            link: null,
            mentions: [],
            renderPlaceholder:props.renderPlaceholder,
            showDropzone:false,
            files:[],
            messageComposerReloadKey:uniqueId()
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret = nextState.text != this.state.text ||
                nextProps.content != this.props.content ||
                nextProps.className != this.props.className ||
                nextProps.refresh != this.props.refresh ||
                nextProps.showEmojiPicker != this.props.showEmojiPicker ||
                nextProps.showSubmitButton != this.props.showSubmitButton ||
                nextProps.singleLine != this.props.singleLine ||
                nextProps.forceHideDropzone != this.props.forceHideDropzone ||

                nextState.showDropzone != this.state.showDropzone ||
                nextState.uploading != this.state.uploading ||
                nextState.link != this.state.link ||
                !nextState.mentions.isEqual(this.state.mentions) ||
                nextState.renderPlaceholder != this.state.renderPlaceholder ||
                !nextState.files.isEqual(this.state.files)
        return ret;
    }
    componentWillUnmount = () => {
        if (this.observer) {
            this.observer.disconnect()
        }
        this.observer = null
        this.formRef = null;
        this.element = null;
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
        const {taggableMembers} = this.props
        ProfileManager.searchProfilesInMembers({search, taggableMembers, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    handleSubmit = () => {
        let content = this.getContent()
        if(this.canPost()){
            this.setState({text:content.text, mentions: content.mentions, }, () => {
                let text = this.state.text.trim();
                this.props.onActionPress(StatusActions.new, {message:text, mentions:this.state.mentions, files:this.state.files})
                this.clearStatusState()//maybe not here?
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
            files: [],
            link: null,
            mentions: [],
            messageComposerReloadKey:uniqueId(),
            showDropzone:false
        }, this.canPost);
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
        return this.state.files.length
    }
    handleMentions = (mentions:number[]) => {
        this.setState({mentions: mentions})
    }
    handleUploadClick = () => {
        if(!this.props.canUpload)
            return
        // Hide/Show dropzone
        if(this.props.forceHideDropzone && this.state.showDropzone)
        {
            return
        }
        if (this.getFilesCount() == 0) {
            this.setState((prevState, currentProps) => {
                return {showDropzone: !prevState.showDropzone}
            })
        }
    }
    handleFileUploaded = (file:UploadedFile) => {
        let files = this.state.files.map(f => f)
        files.push(file)
        this.setState({files: files})
    }
    handleFileQueueComplete = () => {
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
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files});
        }
    }
    removeFileFromList = (file:UploadedFile, fileList:UploadedFile[]) => {
        let list = fileList.map(f => f)
        let index = list.findIndex((item) => {
            return item.id == file.id;
        });
        if(index >= 0)
        {
            list.splice(index, 1)
        }
        return list
    }
    handleRename = (file: UploadedFile, name: string) => {
        if(!name || name.length == 0)
            return
        ApiClient.updateFilename(file.id, name, (data, status, error) => {
            if(!!data && !error)
            {
                this.setState((prevState:State) => {
                    const files = prevState.files.map(f => f)
                    const index = files.findIndex(f => f.id == data.id)
                    if(index > -1)
                    {
                        files[index] = data
                        return {files}
                    }
                    return
                })
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not update filename"))
        })
    }
    renderTextArea = (canSubmit:boolean) => {
        let cn = classnames("secondary-text", this.props.className)
        const placeholder = this.props.placeholder || translate("Write a comment")
        const uploadHandler = this.props.canUpload ? this.handleUploadClick : undefined
        return (
            <ChatMessageComposer
                key={this.state.messageComposerReloadKey}
                className={cn}
                canSubmit={canSubmit}
                onHandleUploadClick={uploadHandler}
                ref={this.formRef}
                content={this.props.content}
                mentionSearch={this.handleMentionSearch}
                onSubmit={this.handleSubmit}
                onDidType={this.onDidType}
                placeholder={placeholder}
                showEmojiPicker={this.props.showEmojiPicker}
                onBlur={this.props.onBlur}
                onFocus={this.props.onFocus}
                showSubmitButton={this.props.showSubmitButton}
                focusEnd={this.props.focusEnd}
                forceUpdate={this.props.forceUpdate}
                singleLine={this.props.singleLine}
                minimumTextLength={0}
                useAdaptiveFontSize={this.props.useAdaptiveFontSize}
            />
        )
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
            const cn = classnames("comment-form status-composer-component", this.props.className)
            const fileUploadClass = classnames("file-upload-container vertical-scroll", {"d-none":this.props.forceHideDropzone })
            return (<div className={cn}>
                    <div className="chat-message-composer-container drop-shadow main-content-secondary-background">
                        {this.props.children}
                        {this.renderTextArea(canPost)}
                        {this.state.showDropzone &&
                        <div className={fileUploadClass}>
                            <FilesUpload
                                files={this.state.files}
                                onFileAdded={this.handleFileAdded}
                                onFileRename={this.handleRename}
                                onFileQueueComplete={this.handleFileQueueComplete}
                                onFileError={this.handleFileError}
                                onFileRemoved={this.handleFileRemoved}
                                onFileUploaded={this.handleFileUploaded}
                                communityId={this.props.communityId}/>
                        </div>
                        }
                    </div>
                </div>)
        } else {
            return null;
        }
    }
}
