import * as React from "react";
import classnames from 'classnames';
import { StatusActions, ContextNaturalKey, UploadedFile } from "../../../types/intrasocial_types";
import { Mention } from "./MentionEditor";
import { ProfileManager } from "../../../managers/ProfileManager";
import { EditorContent, ChatMessageComposer } from "./ChatMessageComposer";
import { URL_REGEX, URL_WWW_REGEX } from "../../../utilities/IntraSocialUtilities";
import { Settings } from "../../../utilities/Settings";
import "./StatusComposerComponent.scss"
import FilesUpload from "../../status/FilesUpload";
import { translate } from "../../../localization/AutoIntlProvider";

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
    uploadedFiles:UploadedFile[]
    tempFilesInDropzone:number
}
type Props = OwnProps & DefaultProps
export class StatusComposerComponent extends React.Component<Props, State> {
    formRef = React.createRef<ChatMessageComposer>();
    dropzoneRef = React.createRef<FilesUpload>();
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
            uploadedFiles:[],
            tempFilesInDropzone:0
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret = nextState.text != this.state.text ||
                nextProps.content != this.props.content ||
                !!nextProps.mentions && !this.props.mentions || 
                !nextProps.mentions && !!this.props.mentions || 
                nextProps.mentions && this.props.mentions && !nextProps.mentions.isEqual(this.props.mentions) || 
                nextProps.className != this.props.className || 
                nextProps.refresh != this.props.refresh || 
                nextProps.showEmojiPicker != this.props.showEmojiPicker ||
                nextProps.showSubmitButton != this.props.showSubmitButton || 
                nextProps.singleLine != this.props.singleLine || 
                nextProps.forceHideDropzone != this.props.forceHideDropzone ||

                nextState.showDropzone != this.state.showDropzone ||
                nextState.tempFilesInDropzone != this.state.tempFilesInDropzone ||
                nextState.uploading != this.state.uploading || 
                nextState.link != this.state.link || 
                !nextState.mentions.isEqual(this.state.mentions) || 
                nextState.renderPlaceholder != this.state.renderPlaceholder ||
                nextState.uploadedFiles.length != this.state.uploadedFiles.length
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
    submit = () => {
        let content = this.getContent()
        if(this.canPost()){
            this.setState(() => {
                    return {text:content.text, mentions: content.mentions}
                } , () => {
                let text = this.state.text.trim();
                this.props.onActionPress(StatusActions.new, {message:text, mentions:this.state.mentions, files:this.state.uploadedFiles})
                this.clearStatusState()//maybe not here?
                this.clearEditor()//maybe not here?
            })
        }
    }
    onTempFilesUploaded = (files:UploadedFile[]) => {
        this.setState((prevState:State) => {
            return {uploadedFiles:files, uploading:false}
        },this.submit)
    }
    handleSubmit = () => {
        if(this.state.uploading)
            return
        if(this.state.tempFilesInDropzone > 0)
        {
            this.setState((prevState:State) => {
                return {uploading:true}
            }, () => {
                this.dropzoneRef.current.uploadFiles(this.onTempFilesUploaded)
            })
        }
        else {
            this.submit()
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
            uploadedFiles: [],
            link: null,
            mentions: []
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
        return (text != null && text.length > 0) || this.getDropzoneFilesCount() > 0
    }
    getDropzoneFilesCount = () => 
    {
        return this.state.tempFilesInDropzone
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
        if (this.getDropzoneFilesCount() == 0) {
            this.setState((prevState, currentProps) => {
                return {showDropzone: !prevState.showDropzone}
            })
        }
    }
    handleTempFilesChanged = (length:number) => {
        this.setState((prevState:State) => {
            const showDropzone = length > 0 || prevState.showDropzone
            return {showDropzone:showDropzone, tempFilesInDropzone:length}
        })
    }
    renderTextArea = (canSubmit:boolean) => {
        let cn = classnames("secondary-text", this.props.className)
        const placeholder = this.props.placeholder || translate("Write a comment")
        const uploadHandler = this.props.canUpload ? this.handleUploadClick : undefined
        return (
            <ChatMessageComposer 
                className={cn} 
                canSubmit={canSubmit} 
                onHandleUploadClick={uploadHandler} 
                ref={this.formRef} 
                content={this.state.text} 
                mentionSearch={this.handleMentionSearch} 
                mentions={this.props.mentions} 
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
            const cn = classnames("comment-form", this.props.className)
            const fileUploadClass = classnames("file-upload-container", {"d-none":this.props.forceHideDropzone })
            return (<div className={cn}>
                    <div className="chat-message-composer-container file-upload-container drop-shadow main-content-secondary-background">
                        {this.props.children}
                        {this.renderTextArea(canPost)}
                        {this.state.showDropzone &&
                        <div className={fileUploadClass}>
                            <FilesUpload ref={this.dropzoneRef}
                                onTempFilesChanged={this.handleTempFilesChanged}
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
