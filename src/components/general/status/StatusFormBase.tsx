import * as React from 'react';
import Constants from "../../../utilities/Constants";
import { UploadedFile } from '../../../reducers/conversations';
import { ChatMessageComposer, IEditorComponent } from '../ChatMessageComposer';
import { Status } from '../../../reducers/statuses';
import { Mention } from '../../input/MentionEditor';

export interface OwnProps
{
    onSubmit:(text:string, mentions:number[]) => void
    onFileAdded:() => void
    onFileRemoved:(file:UploadedFile) => void
    onDidType:() => void
    onFileError:() => void
    onFileUploaded?:(file:UploadedFile) => void
    onFileQueueComplete?:() => void
    onChangeMentions?:(mentions: any) => void
    communityId:number
    canMention:boolean
    canPost:() => boolean
    canUpload:boolean
    files?:UploadedFile[]
    content?:string 
    mentions?:Mention[]
    parentStatus?:Status
    mentionSearch:(search:string, completion:(mentions:Mention[]) => void) => void
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
    canPost()
    {
        return false
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
    onDidType()
    {
        
    }
    renderTextArea(props) {
        return (
            <ChatMessageComposer onHandleUploadClick={this.handleUploadClick} ref={this.inputRef} content={this.props.content} mentionSearch={this.props.mentionSearch} mentions={this.props.mentions} communityId={this.props.communityId} onSubmit={this.handleSubmit} onDidType={this.props.onDidType} />                      
        )
    }
   //<MentionEditor onKeyboardSubmit={this.handleSubmit} onChange={this.props.onTextChange}
    //                             handleUpload={this.handleUploadClick}
    //                             onSuggestionVisibilityChange={this.handleSuggestionVisibility}
     //                            onChangeMentions={this.props.onChangeMentions}
      //                           communityId={this.getCommunityId()}
       //                          feedType={this.getFeedType()}/>
}
