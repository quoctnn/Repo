import * as React from "react"
import StatusFormBase from './StatusFormBase';
import FilesUpload from './FilesUpload';
import classnames from 'classnames';


export class CommentForm extends StatusFormBase {
    constructor(props) {
        super(props)
    }

    handleSuggestionVisibility(showing:boolean) {
        this.setState({isSuggestionsVisible: showing})
    }

    render() {
        const cn = classnames("chat-message-composer-container file-upload-container", this.props.className)
        return (<div className={cn}>
                    {this.renderTextArea(this.props.canPost)}
                    {this.state.showDropzone &&
                        <FilesUpload onFileAdded={this.handleFileAdded}
                                onFileError={this.handleFileError}
                                onFileRemoved={this.handleFileRemoved}
                                onFileUploaded={this.props.onFileUploaded}
                                onFileQueueComplete={this.props.onFileQueueComplete}
                                communityId={this.props.communityId}/>
                    }
                </div>)
        
    }
}
