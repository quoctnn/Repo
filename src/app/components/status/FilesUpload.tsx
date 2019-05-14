import * as React from 'react';
import { DropzoneComponent } from "react-dropzone-component";
import Constants from '../../utilities/Constants';
import { Settings } from '../../utilities/Settings';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { UploadedFile } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { EndpointManager } from '../../managers/EndpointManager';

import "react-dropzone-component/styles/filepicker.css"
import "dropzone/dist/min/dropzone.min.css"
import "./FilesUpload.scss"

var getSuccessFileUploadData = (file) => {
    let res = JSON.parse(file.xhr.responseText);
    if(res && res.files && res.files.length > 0)
    {
        return res.files[0]
    }
    return res
};
var addExistingFiles = (myDropzone, filename, thumb, size, serielized) => {
    // Create the mock file:
    var mockFile = {name: filename, size: size, serialized: serielized};

    // Call the default addedfile event handler
    myDropzone.emit("addedfile", mockFile);

    if(thumb)
    {
        // And optionally show the thumbnail of the file:
        myDropzone.emit("thumbnail", mockFile, thumb);
    }

    // Make sure that there is no progress bar, etc...
    myDropzone.emit("complete", mockFile);
}
export interface OwnProps 
{
    onFileAdded:() => void
    onFileError:() => void
    onFileRemoved:(file:UploadedFile) => void
    onFileUploaded:(file:UploadedFile) => void
    onFileQueueComplete:() => void
    communityId:number
    files?:UploadedFile[]
}
interface DefaultProps 
{
    maxFileSize:number
    acceptedFiles:string
}
interface State 
{
}
type Props = DefaultProps & OwnProps
export default class FilesUpload extends React.Component<Props, State> {  
    static defaultProps:DefaultProps = 
    {
        maxFileSize:Settings.maxFileSize,
        acceptedFiles:Settings.allowedTypesFileUpload,
    }
    constructor(props) {
        super(props);

        // Auto binding
        this.initDropzoneComponent = this.initDropzoneComponent.bind(this);
        this.dropzoneSettings = this.dropzoneSettings.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleFileRemoved = this.handleFileRemoved.bind(this);
    }

    initDropzoneComponent(dropzone) {
        if (typeof this.props.files !== 'undefined') {
            this.props.files.forEach((file) => {
                addExistingFiles(dropzone, file.filename, IntraSocialUtilities.appendAuthorizationTokenToUrl(file.thumbnail), file.size, file)
            })

            // With existing files, adjust it to the correct amount of maxFiles:
            if (dropzone.options.maxFiles !== null && this.props.files.length) {
                var existingFileCount = this.props.files.length;
                dropzone.options.maxFiles = dropzone.options.maxFiles - existingFileCount;
            }
        }

        // Set CSRF token on XHR request header.
        dropzone.on("sending", function (file, xhr, formData) {
            xhr.setRequestHeader("Authorization", "Token " + AuthenticationManager.getAuthenticationToken());
        });
    };

    dropzoneSettings() {
        const params:any = {}
        if(this.props.communityId)
            params.community = this.props.communityId
        return {
            componentConfig: {
                postUrl: EndpointManager.applyEndpointDomain(Constants.apiRoute.fileUploadUrl)
            },

            djsConfig: {
                params: params,
                addRemoveLinks: true,
                dictDefaultMessage: "<i class='fa fa-cloud-upload fa-2x'></i>",
                acceptedFiles: this.props.acceptedFiles,
                maxFilesize: this.props.maxFileSize
            },

            eventHandlers: {
                init: this.initDropzoneComponent,
                error: this.props.onFileError,
                addedfile: this.props.onFileAdded,
                removedfile: this.handleFileRemoved,
                queuecomplete: this.props.onFileQueueComplete,
                success: this.handleFileUpload
            }
        }
    }

    handleFileUpload(file) {
        let uploadedFile = getSuccessFileUploadData(file);
        this.props.onFileUploaded(uploadedFile);
    }

    handleFileRemoved(file) {
        if (typeof (file.xhr) !== 'undefined') {
            try {
                let fileToRemove = getSuccessFileUploadData(file);
                this.props.onFileRemoved(fileToRemove);
            } catch (e) {
                console.error(e)
            }
        } else if (typeof (file.serialized) !== 'undefined') {
            this.props.onFileRemoved(file.serialized);
        } else {
            console.error("Cannot get file serialized data")
        }
    }


    render() {
        let dz = this.dropzoneSettings();
        return (
            <DropzoneComponent config={dz.componentConfig}
                               eventHandlers={dz.eventHandlers}
                               djsConfig={dz.djsConfig}/>
        );
    }
}