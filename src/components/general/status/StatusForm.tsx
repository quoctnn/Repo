import * as React from 'react';
import StatusFormBase from './StatusFormBase';
import FilesUpload from './FilesUpload';

export default class StatusForm extends StatusFormBase {
    constructor(props) {
        super(props)
        this.canPost = this.canPost.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.canMention != this.props.canMention) ||
            (nextProps.canPost != this.props.canPost) ||
            (nextState.showDropzone != this.state.showDropzone) ||
            (nextState.isSuggestionsVisible != this.state.isSuggestionsVisible) ||
            (nextState.filesCount != this.state.filesCount)
    }

    handleSuggestionVisibility(showing:boolean) {
        this.setState({isSuggestionsVisible: showing})
    }

    canPost() {
        return this.props.canPost && !this.state.isSuggestionsVisible
    }

    render() {
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                        {this.renderTextArea({
                                    placeholder: this.props.textPlaceholder,
                                    className: "textarea-create-post status-editor",
                                    rows: 2
                                })}
                                {this.state.showDropzone &&
                        <FilesUpload onFileAdded={this.handleFileAdded}
                                onFileError={this.handleFileError}
                                onFileRemoved={this.handleFileRemoved}
                                onFileUploaded={this.props.onFileUploaded}
                                onFileQueueComplete={this.props.onFileQueueComplete}
                                communityId={this.props.communityId}/>
                    }
                </div>
            </div>
        );
    }
}

