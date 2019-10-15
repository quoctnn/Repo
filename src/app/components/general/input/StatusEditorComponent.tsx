import * as React from 'react';
import { Status, TempStatus, UploadedFile, ContextNaturalKey } from '../../../types/intrasocial_types';
import { EditorContent, ChatMessageComposer } from './ChatMessageComposer';
import { Settings } from '../../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../../utilities/IntraSocialUtilities';
import { ProfileManager } from '../../../managers/ProfileManager';
import { Mention } from './MentionEditor';
import classnames = require('classnames');
import FilesUpload from '../../status/FilesUpload';
import { translate, lazyTranslate } from '../../../localization/AutoIntlProvider';
import {ApiClient} from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import { uniqueId } from '../../../utilities/Utilities';
import { NavigationUtilities } from '../../../utilities/NavigationUtilities';

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
    showDropzone: boolean
}
type Props = OwnProps & DefaultProps
export default class StatusEditorComponent extends React.Component<Props, State> {

    private originalText:string = null
    private protectKey = uniqueId() //protect navigation if files has changed
    formRef = React.createRef<ChatMessageComposer>();
    static defaultProps:DefaultProps =
    {
        textPlaceholder:"✎",
        singleLine:false,
        forceHideDropzone:false
    }
    constructor(props:Props) {
        super(props)
        const files = this.props.status.files.map(f => f) || []
        this.state = {
            text: this.props.status.text,
            files: files,
            uploading: false,
            link: this.props.status.link,
            showDropzone:files.length > 0,
        };
    }
    getNavigationProtectionKeys = () => {
        return [this.protectKey]
    }
    componentDidMount = () => {
        this.originalText = this.formRef.current.getPlainText()
    }
    componentDidUpdate = () => {
        const hasChanged = this.hasContentChanged()
        NavigationUtilities.protectNavigation(this.protectKey, hasChanged)
    }
    componentWillUnmount = () => {
        NavigationUtilities.protectNavigation(this.protectKey, false)
        this.originalText = null;
        this.protectKey = null;
        this.formRef = null;
    }
    hasContentChanged = () => {
        if(this.state.text != this.originalText)
            return true
        const inFiles = this.props.status.files.map(f => f.id).sort((a,b) => a - b)
        const currentFiles = this.state.files.map(f => f.id).sort((a,b) => a - b)
        return !inFiles.isEqual(currentFiles)
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

        return (text != null && text.length > 0) || this.getFilesCount() > 0
    }
    getFilesCount = () =>
    {
        return this.state.files.length
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
    handleSubmit = () => {
        let content = this.getContent()
        this.setState({text:content.text}, () => {
            if (!this.canPost()) {
                return;
            }

            let text = this.state.text.trim();
            let link = this.findPrimaryLink();

            var status:Partial<Status> = {
                id: this.props.status.id,
                text: text,
                files_ids: this.state.files.map(f => f.id),
                link: link,
                parent: this.props.status.parent || null,
            };
            if(this.props.status.privacy)
            {
                status.privacy = this.props.status.privacy
            }
            // Don't need to check if is comment for editing, just calling status submit
            this.props.onStatusSubmit(status as Status, this.state.files);

            this.clearStatusState()
            this.clearEditor()
            NavigationUtilities.protectNavigation(this.protectKey, false)
        })
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
            link: null,
        });
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) =>
    {
        console.log("searching", search)
        const taggableMembers = this.props.status.visibility
        ProfileManager.searchProfilesInMembers({search, taggableMembers, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    onDidType = (unprocessedText:string) =>
    {
        this.setState({text: unprocessedText})
    }
    handleFileAdded = () =>
    {
        this.setState({uploading: true});
    }
    handleFileRemoved = (file:UploadedFile) =>
    {
        if (typeof file !== 'undefined' && file != null) {
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files});
        }
    }
    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }
    handleFileQueueComplete = () =>
    {
        this.setState({uploading: false});
    }
    handleFileUploaded = (file) =>
    {
        let files = this.state.files.map(f => f)
        files.push(file)
        this.setState({files: files})
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
        if (this.getFilesCount() == 0) {
            this.setState((prevState, currentProps) => {
                return {showDropzone: !prevState.showDropzone}
            })
        }
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
                useAdaptiveFontSize={true}
            />
        )
    }
    render() {
        const canPost = this.canPost()
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                    {this.renderTextArea(canPost)}
                    {this.state.showDropzone && <FilesUpload
                                files={this.state.files}
                                onFileRename={this.handleRename}
                                onFileAdded={this.handleFileAdded}
                                onFileQueueComplete={this.handleFileQueueComplete}
                                onFileError={this.handleFileError}
                                onFileRemoved={this.handleFileRemoved}
                                onFileUploaded={this.handleFileUploaded}
                                communityId={this.props.communityId}/>
                        }
                </div>
            </div>
        );
    }
}