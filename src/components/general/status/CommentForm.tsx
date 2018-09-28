import * as React from "react"
import StatusFormBase from './StatusFormBase';
import { translate } from '../../intl/AutoIntlProvider';
import FilesUpload from './FilesUpload';


export class CommentForm extends StatusFormBase {
    constructor(props) {
        super(props)
    }

    handleSuggestionVisibility(showing:boolean) {
        this.setState({isSuggestionsVisible: showing})
    }

    render() {
        const placeholder = translate("Write a comment")
        return (<>
                    {this.renderTextArea({
                        rows: 1,
                        placeholder: placeholder,
                        className: "textarea-create-post status-editor",
                        showUploadButton:true
                    })}
                    {this.state.showDropzone &&
                        <FilesUpload onFileAdded={this.handleFileAdded}
                                onFileError={this.handleFileError}
                                onFileRemoved={this.handleFileRemoved}
                                onFileUploaded={this.props.onFileUploaded}
                                onFileQueueComplete={this.props.onFileQueueComplete}
                                communityId={this.props.communityId}/>
                    }
                </>)
        
    }
}
