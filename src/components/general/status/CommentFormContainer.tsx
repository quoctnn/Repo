import * as React from "react";
import StatusFormContainerBase from './StatusFormContainerBase';
import { CommentForm } from './CommentForm';
export default class CommentFormContainer extends StatusFormContainerBase {
    shouldComponentUpdate(nextProps, nextState) {
        return true
    }

    render() {
        if ((this.props.canComment && this.props.parentStatus.can_comment) || false) {
            const canPost = this.canPost()
            return (
                <CommentForm
                    onFileError={this.handleFileError}
                    mentionSearch={this.handleMentionSearch}
                    ref={this.formRef}
                    onDidType={this.onDidType}
                    communityId={this.props.communityId}
                    canUpload={this.props.canUpload}
                    //onTextChange={this.handleTextChange}
                    canPost={canPost}
                    onSubmit={this.handleSubmit}
                    onFileAdded={this.handleFileAdded}
                    onFileRemoved={this.handleFileRemoved}
                    onFileUploaded={this.handleFileUploaded}
                    onFileQueueComplete={this.handleFileQueueComplete}
                    onChangeMentions={this.handleMentions}
                    canMention={this.props.canMention}
                    parentStatus={this.props.parentStatus}/>
            );
        } else {
            return null;
        }
    }
}


