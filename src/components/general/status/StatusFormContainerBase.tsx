import * as React from 'react';
import { Settings } from '../../../utilities/Settings';
import { URL_REGEX, URL_WWW_REGEX } from '../../../utilities/Utilities';
import { Mention } from '../../input/MentionEditor';
import ApiClient from '../../../network/ApiClient';
import { IEditorComponent, EditorContent } from '../ChatMessageComposer';
import { TempStatus, UploadedFile, Status } from '../../../types/intrasocial_types';

export interface Props 
{
    status?:Status //edit
    parentStatus?:Status//comment
    onCommentSubmit?:(comment:TempStatus, files:UploadedFile[]) => void
    onStatusSubmit?:(status:TempStatus, files:UploadedFile[]) => void
    contextNaturalKey?:string
    contextObjectId?:number
    canMention:boolean
    canComment:boolean
    canUpload:boolean
    communityId:number
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

export default class StatusFormContainerBase extends React.Component<Props, State> {  

    formRef = React.createRef<IEditorComponent & any>();
    constructor(props) {
        super(props)

        this.state = {
            text: '',
            files_ids: [],
            files: [],
            uploading: false,
            link: null,
            mentions: []
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

    handleMentionSearch(search:string, completion:(mentions:Mention[]) => void)
    {
        if(this.props.communityId)
        {
            console.log("searching", search)
            ApiClient.getCommunityMembers(this.props.communityId, (data, status, error) => {
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
                parent: (this.props.parentStatus) ? this.props.parentStatus.id : null,
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

    handleFileQueueComplete() {
        this.setState({uploading: false});
    }

    handleFileAdded() {
        this.setState({uploading: true});
    }

    handleFileError() {
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

    removeFileFromList(file, fileList:UploadedFile[]) {
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

    removeFileIdFromList(file, fileIdList:number[]) {
        let list = fileIdList.map(f => f)
        let index = list.indexOf(file.id)
        if(index >= 0)
        {
            list.splice(index, 1)
            return list
        }
        return list
    }

    handleFileUploaded(file) {
        let files = this.state.files.map(f => f)
        files.push(file)
        let files_ids = this.state.files_ids.map(f => f)
        files_ids.push(file.id)
        this.setState({files: files, files_ids: files_ids})
    }
}