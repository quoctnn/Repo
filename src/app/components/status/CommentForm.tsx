import * as React from "react"
import FilesUpload from './FilesUpload';
import classnames from 'classnames';
import "./CommentForm.scss"
import classNames = require("classnames");
import { ChatMessageComposer } from "../general/input/ChatMessageComposer";
import { translate } from "../../localization/AutoIntlProvider";
import { UploadedFile } from "../../types/intrasocial_types";
import { Mention } from "../general/input/MentionEditor";
import Constants from "../../utilities/Constants";
export interface OwnProps
{
    onSubmit:(text:string, mentions:number[]) => void
    onFileRemoved?:(file:UploadedFile) => void
    onDidType:(unprocessedText:string) => void
    onChangeMentions?:(mentions: any) => void
    contextObjectId:number 
    contextNaturalKey:string
    canPost:boolean
    canUpload:boolean
    files?:UploadedFile[]
    content?:string 
    mentions?:Mention[]
    mentionSearch:(search:string, completion:(mentions:Mention[]) => void) => void
    className?:string
    communityId:number
    showEmojiPicker?:boolean
    showSubmitButton?:boolean
    placeholder?:string
    children?:React.ReactNode
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
    focusEnd?:(f:() => void) => void
    forceUpdate?:string
}
export interface DefaultProps
{
    textPlaceholder:string
    singleLine:boolean
    forceHideDropzone:boolean
}
interface State 
{
    showDropzone: boolean
    filesCount: number
    isSuggestionsVisible:boolean
}
type Props = OwnProps & DefaultProps
export class CommentForm extends React.Component<Props, State> {
    inputRef = React.createRef<ChatMessageComposer>();
    static defaultProps:DefaultProps =
    {
        textPlaceholder:"✎",
        singleLine:false,
        forceHideDropzone:false
    }
    constructor(props) {
        super(props)
        this.state = {showDropzone: false, filesCount: 0, isSuggestionsVisible:false}
    }
    getContent = () => {
        return this.inputRef.current.getProcessedText()
    }
    clearEditorContent = () => {
    }
    handleSubmit = (text:string, mentions:number[]) => {

        this.setState({showDropzone: false, filesCount: 0})
        this.props.onSubmit(text, mentions)
    }

    handleUploadClick = () => {

        if(!this.props.canUpload)
            return
        // Hide/Show dropzone
        if(this.props.forceHideDropzone && this.state.showDropzone)
        {
            return
        }
        if (this.state.filesCount == 0) {
            this.setState((prevState, currentProps) => {
                return {showDropzone: !prevState.showDropzone}
            })
        }
    }
    handleFileRemoved = (file:UploadedFile) => {
        this.setState((prevState, currentProps) => {
            return {filesCount: prevState.filesCount - 1}
        })

        this.props.onFileRemoved(file)
    }

    getFeedType = () => {
        // Just profile or community for now
        // TODO: Maybe consider adding groups and project feeds later
        if (window.location.href.endsWith(Constants.urlsRoute.myProfile)) {
            return "profile";
        }
        else {
            return "community";
        }
    }
    handleTempFilesChanged = (length:number) => {
    }
    renderTextArea = (canSubmit:boolean) => {
        let cn = classNames("secondary-text", this.props.className)
        const placeholder = this.props.placeholder || translate("Write a comment")
        const uploadHandler = this.props.canUpload ? this.handleUploadClick : undefined
        return (
            <ChatMessageComposer 
                className={cn} 
                canSubmit={canSubmit} 
                onHandleUploadClick={uploadHandler} 
                ref={this.inputRef} 
                content={this.props.content} 
                mentionSearch={this.props.mentionSearch} 
                mentions={this.props.mentions} 
                onSubmit={this.handleSubmit} 
                onDidType={this.props.onDidType} 
                placeholder={placeholder}
                showEmojiPicker={this.props.showEmojiPicker}
                onBlur={this.props.onBlur}
                onFocus={this.props.onFocus}
                showSubmitButton={this.props.showSubmitButton}
                focusEnd={this.props.focusEnd}
                forceUpdate={this.props.forceUpdate}
                singleLine={this.props.singleLine}
            />                      
        )
    }
    render = () => {
        const cn = classnames("comment-form", this.props.className)
        const fileUploadClass = classnames("file-upload-container", {"d-none":this.props.forceHideDropzone })
        return (<div className={cn}>
                    <div className="chat-message-composer-container file-upload-container drop-shadow main-content-secondary-background">
                        {this.props.children}
                        {this.renderTextArea(this.props.canPost)}
                        {this.state.showDropzone &&
                        <div className={fileUploadClass}>
                            <FilesUpload
                                onTempFilesChanged={this.handleTempFilesChanged}
                                onFileRemoved={this.handleFileRemoved}
                                communityId={this.props.communityId}/>
                        </div>
                        }
                    </div>
                </div>)
        
    }
}
