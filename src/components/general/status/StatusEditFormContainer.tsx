import * as React from 'react';
import StatusFormContainerBase from "./StatusFormContainerBase";
import StatusForm from "./StatusForm";
import { Mention } from '../../input/MentionEditor';
import { ProfileManager } from '../../../main/managers/ProfileManager';

export default class StatusEditFormContainer extends StatusFormContainerBase {

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

    render() {
        return (
            <StatusEditForm
                mentionSearch={this.handleMentionSearch}
                communityId={this.props.communityId}
                ref={this.formRef}
                content={this.state.text}
                mentions={ProfileManager.getProfiles(this.props.status.mentions).map(m => Mention.fromUser(m))}
                files={this.props.status.files}
                canPost={this.canPost}
                onDidType={this.props.onDidType}
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
        
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                    {this.renderTextArea({
                                    content: this.props.content,
                                    mentions: this.props.mentions,
                                    placeholder: this.props.textPlaceholder,
                                    className: "textarea-create-post status-editor",
                                    rows: 2
                            })}
                </div>
            </div>
        );
    }
}