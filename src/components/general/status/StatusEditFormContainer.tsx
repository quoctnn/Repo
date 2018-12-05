import * as React from 'react';
import StatusForm from "./StatusForm";
import { Mention } from '../../input/MentionEditor';
import { ProfileManager } from '../../../managers/ProfileManager';
import StatusFormContainer from './StatusFormContainer';
import { Status, TempStatus, UploadedFile } from '../../../types/intrasocial_types';
import { EditorContent, IEditorComponent } from '../ChatMessageComposer';
import { Settings } from '../../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../../utilities/IntraSocialUtilities';
import ApiClient from '../../../network/ApiClient';

interface Props 
{
    communityId?:number
    status:Status
    onStatusSubmit?:(status:TempStatus, files:UploadedFile[]) => void
    contextNaturalKey?:string
    contextObjectId?:number
    canMention:boolean
    canComment:boolean
    canUpload:boolean
}
interface State 
{
    text: string,
    files_ids: number[],
    files: UploadedFile[],
    uploading: boolean,
    link: string,
    mentions: number[]
}
export default class StatusEditFormContainer extends  React.Component<Props, State> {

    formRef = React.createRef<IEditorComponent & any>();
    constructor(props) {
        super(props)

        let files_ids = []
        if (this.props.status.files) {
            files_ids = this.props.status.files.map((file) => {
                return file.id
            })
        }

        this.state = {
            text: this.props.status.text,
            files_ids: files_ids,
            files: this.props.status.files || [],
            uploading: false,
            link: this.props.status.link,
            mentions: this.props.status.mentions
        };
    }
    getContent():EditorContent {
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
        return this.state.files_ids.length
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
    handleSubmit() {
        let content = this.getContent()
        this.setState({text:content.text, mentions: content.mentions}, () => {
            if (!this.canPost()) {
                return;
            }
    
            let text = this.state.text.trim();
            let link = this.findPrimaryLink();
    
            var status = {
                id: this.props.status.id,
                text: text,
                privacy: this.props.status.privacy || null,
                files_ids: this.state.files_ids,
                link: link,
                parent: this.props.status.parent || null,
                mentions: this.state.mentions
            };
    
            // Don't need to check if is comment for editing, just calling status submit
            this.props.onStatusSubmit(status, this.state.files);
    
            this.clearStatusState()
            this.clearEditor()
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
            files_ids: [],
            files: [],
            link: null,
            mentions: []
        });
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) => 
    {
        if(this.props.status.community)
        {
            console.log("searching", search)
            ApiClient.getCommunityMembers(this.props.status.community.id, (data, status, error) => {
                completion(data.map(u => Mention.fromUser(u)))
            })
        }
    }
    handleFileAdded = () => 
    {
        this.setState({uploading: true});
    }
    onDidType = (unprocessedText:string) =>
    {
        this.setState({text: unprocessedText})
    }
    handleFileRemoved = (file) => 
    {
        if (typeof file !== 'undefined' && file != null) {
            let files_ids = this.removeFileIdFromList(file, this.state.files_ids)
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files, files_ids: files_ids});
        }
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
    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }
    handleFileUploaded = (file) => 
    {
        let files = this.state.files.map(f => f)
        files.push(file)
        let files_ids = this.state.files_ids.map(f => f)
        files_ids.push(file.id)
        this.setState({files: files, files_ids: files_ids})
    }
    handleFileQueueComplete = () => 
    {
        this.setState({uploading: false});
    }
    render() {
        const canPost = this.canPost()
        return (
            <StatusEditForm
                mentionSearch={this.handleMentionSearch}
                communityId={this.props.communityId}
                ref={this.formRef}
                content={this.state.text}
                mentions={ProfileManager.getProfiles(this.props.status.mentions).map(m => Mention.fromUser(m))}
                files={this.props.status.files}
                canPost={canPost}
                onDidType={this.onDidType}
                onSubmit={this.handleSubmit}
                onFileAdded={this.handleFileAdded}
                onFileRemoved={this.handleFileRemoved}
                onFileError={this.handleFileError}
                onFileUploaded={this.handleFileUploaded}
                onFileQueueComplete={this.handleFileQueueComplete}
                //onChangeMentions={this.handleMentions}
                canMention={this.props.canMention}
                canUpload={this.props.canUpload}
                />
        );
    }
}

class StatusEditForm extends StatusForm{
    constructor(props) {
        super(props)
        this.state = {
            showDropzone:this.props.files && this.props.files.length > 0, 
            filesCount:(this.props.files) ? this.props.files.length : 0, 
            isSuggestionsVisible:false
        }
    }
    render() {
        const canPost = this.canPost()
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                    {this.renderTextArea(canPost)}
                </div>
            </div>
        );
    }
}