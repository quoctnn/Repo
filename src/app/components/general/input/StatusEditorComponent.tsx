import * as React from 'react';
import { Status, TempStatus, UploadedFile, ContextNaturalKey } from '../../../types/intrasocial_types';
import { EditorContent, ChatMessageComposer } from './ChatMessageComposer';
import { Settings } from '../../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../../utilities/IntraSocialUtilities';
import { ProfileManager } from '../../../managers/ProfileManager';
import { Mention } from './MentionEditor';
import classnames = require('classnames');
import FilesUpload from '../../status/FilesUpload';
import { translate } from '../../../localization/AutoIntlProvider';

type OwnProps = {
    communityId?:number
    status:Status
    onStatusSubmit?:(status:TempStatus, files:UploadedFile[]) => void
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    canMention:boolean
    canUpload:boolean
    showEmojiPicker?:boolean
    className?:string
    onBlur?(e: React.SyntheticEvent<{}>): void
    onFocus?(e: React.SyntheticEvent<{}>): void
    focusEnd?:(f:() => void) => void
    showSubmitButton?:boolean
    forceUpdate?:string
}
type DefaultProps = {
    textPlaceholder:string
    singleLine:boolean
    forceHideDropzone:boolean
}
type State = {
    text: string
    files: UploadedFile[]
    uploading: boolean
    link: string
    mentions: number[]
    showDropzone: boolean
    uploadedFiles:UploadedFile[]
    tempFilesInDropzone:number
}
type Props = OwnProps & DefaultProps
export default class StatusEditorComponent extends React.Component<Props, State> {

    formRef = React.createRef<ChatMessageComposer>();
    dropzoneRef = React.createRef<FilesUpload>();
    static defaultProps:DefaultProps =
    {
        textPlaceholder:"✎",
        singleLine:false,
        forceHideDropzone:false
    }
    constructor(props:Props) {
        super(props)
        const files = this.props.status.files || []
        this.state = {
            text: this.props.status.text,
            files: files,
            uploading: false,
            link: this.props.status.link,
            mentions: this.props.status.mentions,
            showDropzone:files.length > 0, 
            uploadedFiles:[],
            tempFilesInDropzone:0,
        };
    }
    getContent = ():EditorContent => {
        return this.formRef.current.getContent()
    }
    canPost = () =>
    {
        let text = this.state.text.trim()

        if (this.state.uploading || text.length > Settings.commentMaxLength) {
            return false;
        }

        return (text != null && text.length > 0) || this.getDropzoneFilesCount() > 0
    }
    getDropzoneFilesCount = () => 
    {
        return this.state.files.length + this.state.tempFilesInDropzone
    }
    findPrimaryLink = () => 
    {
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
    submit = () => {
        let content = this.getContent()
        this.setState(() => {
            return {text:content.text, mentions: content.mentions}},
            () => {
            if (!this.canPost()) {
                return;
            }
            let text = this.state.text.trim();
            let link = this.findPrimaryLink();
            var status:Partial<Status> = {
                id: this.props.status.id,
                text: text,
                files_ids: this.state.files.map(f => f.id).concat(this.state.uploadedFiles.map(f => f.id)),
                link: link,
                parent: this.props.status.parent || null,
                mentions: this.state.mentions
            }
            if(this.props.status.privacy)
            {
                status.privacy = this.props.status.privacy
            }
            // Don't need to check if is comment for editing, just calling status submit
            this.props.onStatusSubmit(status as Status, this.state.files.concat(this.state.uploadedFiles));
    
            this.clearStatusState()
            this.clearEditor()
        })
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
    clearEditor = () => 
    {
        this.formRef.current.clearEditorContent()
    }
    clearStatusState = () => 
    {
        this.setState({
            text: '',
            files: [],
            uploadedFiles:[],
            link: null,
            mentions: []
        });
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) => 
    {
        console.log("searching", search)
        /*ProfileManager.searchMembersInContext(search, this.props.status.context_object_id, this.props.status.context_natural_key, (members) => {
            completion(members.map(u => Mention.fromUser(u)))
        })*/
        const taggableMembers = this.props.status.visibility
        const contextNaturalKey = this.props.status.context_natural_key
        const contextObjectId = this.props.status.context_object_id
        ProfileManager.searchProfilesInContext({search, taggableMembers, contextNaturalKey, contextObjectId, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    onDidType = (unprocessedText:string) =>
    {
        this.setState({text: unprocessedText})
    }
    handleFileRemoved = (file:UploadedFile) => 
    {
        if (typeof file !== 'undefined' && file != null) {
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files});
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
            const filesInDropzone = length + this.state.files.length
            const showDropzone = filesInDropzone > 0 || prevState.showDropzone
            return {showDropzone:showDropzone, tempFilesInDropzone:length}
        })
    }
    renderTextArea(canSubmit:boolean) {
        let cn = classnames("secondary-text", this.props.className)
        const placeholder = this.props.textPlaceholder || translate("Write a comment")
        const uploadHandler = this.props.canUpload ? this.handleUploadClick : undefined
        return (
            <ChatMessageComposer 
                className={cn} 
                canSubmit={canSubmit} 
                onHandleUploadClick={uploadHandler} 
                ref={this.formRef} 
                content={this.state.text} 
                mentionSearch={this.handleMentionSearch} 
                mentions={ProfileManager.getProfiles(this.props.status.mentions).map(m => Mention.fromUser(m))} 
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
    render() {
        const canPost = this.canPost()
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                    {this.renderTextArea(canPost)}
                    {this.state.showDropzone && <FilesUpload ref={this.dropzoneRef}
                                files={this.state.files}
                                onTempFilesChanged={this.handleTempFilesChanged}
                                onFileRemoved={this.handleFileRemoved}
                                communityId={this.props.communityId}/>
                        }
                </div>
            </div>
        );
    }
}