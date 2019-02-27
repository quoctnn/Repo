import * as React from 'react';
import Constants from "../../../utilities/Constants";
import { UploadedFile } from '../../../types/intrasocial_types';
import classnames from 'classnames';
import { translate } from '../../../localization/AutoIntlProvider';
import { Mention } from '../input/MentionEditor';
import { ChatMessageComposer, IEditorComponent } from '../input/ChatMessageComposer';

export interface OwnProps
{
    onSubmit:(text:string, mentions:number[]) => void
    onFileAdded:() => void
    onFileRemoved:(file:UploadedFile) => void
    onDidType:(unprocessedText:string) => void
    onFileError:() => void
    onFileUploaded?:(file:UploadedFile) => void
    onFileQueueComplete?:() => void
    onChangeMentions?:(mentions: any) => void
    contextObjectId:number 
    contextNaturalKey:string
    canMention:boolean
    canPost:boolean
    canUpload:boolean
    files?:UploadedFile[]
    content?:string 
    mentions?:Mention[]
    mentionSearch:(search:string, completion:(mentions:Mention[]) => void) => void
    className?:string
    communityId:number
}
export interface DefaultProps
{
    textPlaceholder:string
}

interface State 
{
    showDropzone: boolean
    filesCount: number
    isSuggestionsVisible:boolean
}
type Props = OwnProps & DefaultProps
export default class StatusFormBase extends React.Component<Props, State> implements IEditorComponent {

    inputRef = React.createRef<IEditorComponent & any>();
    static defaultProps:DefaultProps =
    {
        textPlaceholder:"✎"
    }
    constructor(props) {
        super(props)

        this.state = {showDropzone: false, filesCount: 0, isSuggestionsVisible:false}

        // Auto binding
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleUploadClick = this.handleUploadClick.bind(this)
        this.handleFileAdded = this.handleFileAdded.bind(this)
        this.handleFileError = this.handleFileError.bind(this)
        this.handleFileRemoved = this.handleFileRemoved.bind(this)
        this.handleSuggestionVisibility = this.handleSuggestionVisibility.bind(this)
        this.renderTextArea = this.renderTextArea.bind(this)
    }
    getContent() 
    {
        return this.inputRef.current.getProcessedText()
    }
    clearEditorContent()
    {
        console.log("clear, why?")
    }
    handleSubmit(text:string, mentions:number[]) {
        this.setState({showDropzone: false, filesCount: 0})
        this.props.onSubmit(text, mentions)
    }

    handleUploadClick() {
        // Hide/Show dropzone
        if (this.state.filesCount == 0) {
            this.setState((prevState, currentProps) => {
                return {showDropzone: !prevState.showDropzone}
            })
        }
    }

    handleFileAdded() {
        this.setState((prevState, currentProps) => {
            return {filesCount: prevState.filesCount + 1}
        })

        this.props.onFileAdded()
    }

    handleFileRemoved(file) {
        this.setState((prevState, currentProps) => {
            return {filesCount: prevState.filesCount - 1}
        })

        this.props.onFileRemoved(file)
    }

    handleFileError() {
        this.setState((prevState, currentProps) => {
            return {filesCount: prevState.filesCount - 1}
        })

        this.props.onFileError()
    }

    handleSuggestionVisibility(showing:boolean) {
        // Implement only if needed
    }

    render() {
        return null
        // Implement
    }
    getFeedType() {
        // Just profile or community for now
        // TODO: Maybe consider adding groups and project feeds later
        if (window.location.href.endsWith(Constants.urlsRoute.myProfile)) {
            return "profile";
        }
        else {
            return "community";
        }
    }
    renderTextArea(canSubmit:boolean) {
        let cn = classnames("secondary-text", this.props.className)
        const placeholder = translate("Write a comment")
        return (
            <ChatMessageComposer 
            className={cn} 
            canSubmit={canSubmit} 
            onHandleUploadClick={this.handleUploadClick} 
            ref={this.inputRef} 
            content={this.props.content} 
            mentionSearch={this.props.mentionSearch} 
            mentions={this.props.mentions} 
            onSubmit={this.handleSubmit} 
            onDidType={this.props.onDidType} 
            placeholder={placeholder}
            />                      
        )
    }
}
