import * as React from 'react';
import StatusFormBase from './StatusFormBase';
import FilesUpload from '../status/FilesUpload';

export default class StatusForm extends StatusFormBase {
    constructor(props) {
        super(props)
        this.canPost = this.canPost.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.canPost != this.props.canPost) ||
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
    handleTempFilesChanged = () => {
        
    }
    render() {
        const canPost = this.canPost()
        return (
            <div className="panel panel-flat create-post-panel">
                <div className="panel-body">
                        {this.renderTextArea(canPost)}
                        {/*this.state.showDropzone && 
                            <FilesUpload 
                                ref={this.fileUploadRef} 
                                onTempFilesChanged={this.handleTempFilesChanged}
                                communityId={this.props.communityId}/>
                        */}
                </div>
            </div>
        );
    }
}

