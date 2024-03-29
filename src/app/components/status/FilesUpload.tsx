import * as React from 'react';
import { Settings } from '../../utilities/Settings';
import { UploadedFile, UploadedFileType, UserProfile } from '../../types/intrasocial_types';
import Dropzone from 'react-dropzone';
import * as Mime from "mime-types"
import "./FilesUpload.scss"
import FileListItem from '../../modules/files/FileListItem';
import ListComponent, { ListComponentHeader } from '../general/ListComponent';
import { FileUploaderService, FileQueueObject, ExtendedFile } from './FileUploadService';
import { ReduxState } from '../../redux';
import { connect } from 'react-redux';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { translate } from '../../localization/AutoIntlProvider';
import Swiper from "react-id-swiper";
import classnames from 'classnames';

type OwnProps = {
    onFileRemoved?:(file:UploadedFile) => void
    onFileAdded:() => void
    onFileError:() => void
    onFileUploaded:(file:UploadedFile) => void
    onFileRename?:(file:UploadedFile, name:string) => void
    onFileQueueComplete:() => void
    communityId:number
    files?:UploadedFile[]
    className?:string
    renderFile?:(file:UploadedFile) => JSX.Element
}
type DefaultProps = {
    maxFileSize:number
    acceptedFiles:string
    showDropzoneTarget:boolean
    showListHeader:boolean
    horizontalLayout:boolean
}
type FileListItemType = UploadedFile | ExtendedFile
type State = {
    files:FileQueueObject[]
    queueWorking:boolean
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
}
type Props = DefaultProps & OwnProps & ReduxStateProps

class FilesUpload extends React.Component<Props, State> {
    filesList = React.createRef<ListComponent<FileListItemType>>()
    listComponent = React.createRef<HTMLDivElement>()
    private fileUploaderService:FileUploaderService = null
    static defaultProps:DefaultProps = {
        maxFileSize:Settings.maxFileSize,
        acceptedFiles:Settings.allowedTypesFileUpload,
        showDropzoneTarget:true,
        showListHeader:true,
        horizontalLayout:false
    }
    constructor(props:Props) {
        super(props)
        this.fileUploaderService = new FileUploaderService()
        this.fileUploaderService.onCompleteItem = this.onCompleteItem
        this.fileUploaderService.onFailedItem = this.onFailedItem
        this.fileUploaderService.onAddedItem = this.onAddedItem
        this.fileUploaderService.onQueueUpdated = this.onQueueUpdated
        this.state = {
          files: [],
          queueWorking:false,
        }
    }
    scrollToTop = () => {
        this.listComponent && this.listComponent.current && this.listComponent.current.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }
    componentWillUnmount = () => {
        this.cleanup()
        this.filesList = null
        this.fileUploaderService.clearQueue()
        this.fileUploaderService = null
    }
    onQueueUpdated = (queue: FileQueueObject[]) => {
        const completed = queue.length == 0 || queue.filter(f => f.isError()).length == queue.length
        const onComplete = completed ? this.props.onFileQueueComplete : undefined
        this.setState((prevState:State) => {
            return {files:queue}
        }, onComplete)
    }
    onAddedItem = (queueObj: FileQueueObject) => {
        this.props.onFileAdded()
    }
    onCompleteItem = (queueObj: FileQueueObject) => {
        const file = queueObj.response
        queueObj.remove()
        this.props.onFileUploaded(file)
    }
    onFailedItem = (queueObj: FileQueueObject) => {
        this.props.onFileError()
    }
    onDrop = (acceptedFiles:File[]) => {
        const files:ExtendedFile[] = acceptedFiles.map(f => {
            const extension =  Mime.extension(f.type)
            const type = UploadedFileType.parseFromMimeType(f.type)
            const tempId = f.name + f.lastModified
            const file = Object.assign(f,{id:tempId.hashCode(), tempId, fileType:type, extension}) as ExtendedFile
            if(f.type.startsWith("image/"))
                file.preview =  URL.createObjectURL(f)
            return file
        })
        const queue = this.fileUploaderService.queue()
        const newFiles = files.filter(f => !queue.find(sf => sf.file.tempId == f.tempId) )
        this.fileUploaderService.addToQueue(newFiles)
        this.fileUploaderService.uploadAll()
    }
    cleanup = () => {
        const files = this.state.files
        files.forEach(file => URL.revokeObjectURL(file.file.preview));
    }
    removeUploadedFile = (file:UploadedFile) => {
        this.props.onFileRemoved && this.props.onFileRemoved(file)
    }
    removeTempFile = (item:FileQueueObject) => {
        if(item)
        {
            item.file.preview && URL.revokeObjectURL(item.file.preview)
            item.cancel()
            item.remove()
        }
    }
    handleRemoveFile = (file:UploadedFile) => {
        if(file.custom)
        {
            const tempFileId = this.state.files.findIndex(f => f.file.tempId == file.tempId)
            if(tempFileId > -1)
                this.removeTempFile(this.state.files[tempFileId])
        }
        else {
            this.removeUploadedFile(file)
        }
    }
    handleFileRetryUpload = (file:UploadedFile) => {
        if(file.custom && file.hasError)
        {
            const tempFileId = this.state.files.findIndex(f => f.file.tempId == file.tempId)
            if(tempFileId > -1)
            {
                const file = this.state.files[tempFileId]
                file.upload()
            }
        }
    }
    renderFile = (file:UploadedFile) =>  {
        if(this.props.renderFile)
            return this.props.renderFile(file)
        const rename = this.props.onFileRename && file.user == this.props.authenticatedUser.id ? this.props.onFileRename : undefined
        const handleRetry = file.custom && file.hasError ? this.handleFileRetryUpload : undefined
        return <FileListItem onRetryUpload={handleRetry} key={file.id} file={file} onRemove={this.handleRemoveFile} onRename={rename} useLink={false} />
    }
    convertFile = (queueObj:FileQueueObject):UploadedFile => {
        return {
            id:queueObj.file.id,
            user: -1,
            filename: queueObj.file.name,
            file: null,
            type: queueObj.file.fileType,
            extension: queueObj.file.extension,
            image: null,
            image_width: 0,
            image_height: 0,
            thumbnail: queueObj.file.preview,
            size: queueObj.file.size,
            created_at: new Date().toUTCString(),
            //ext
            tempId:queueObj.file.tempId,
            custom: true,
            uploadProgress:queueObj.progress,
            uploading:queueObj.inProgress(),
            uploaded:queueObj.isSuccess(),
            hasError:queueObj.isError()
        }
    }
    renderFiles = () => {
        const incomingFiles = this.props.files || []
        return <div ref={this.listComponent} className="list list-component-list vertical-scroll">
                    {this.state.files.map(f => this.renderFile(this.convertFile(f)))}
                    {this.props.showListHeader && incomingFiles.length > 0 &&
                        <ListComponentHeader title={translate("files.uploaded")} />
                    }
                    {incomingFiles.map(f => this.renderFile(f))}
                </div>
    }
    renderFilesHorizontal = () => {
        const incomingFiles = this.props.files || []
        const params = {
            slidesPerView: "auto",
            spaceBetween: 10,
            freeMode: true,
            shouldSwiperUpdate:true,
          }
        const files = incomingFiles.map(f => this.renderFile(f)).concat(
            this.state.files.map(f => this.renderFile(this.convertFile(f)))
        )
        return  (<Swiper {...params}>
                    { files }
                </Swiper>)
    }
    render = () => {
        const {horizontalLayout} = this.props
        return <Dropzone onDrop={this.onDrop} accept={this.props.acceptedFiles}>
                    {({getRootProps, getInputProps}) => (
                        <div className={classnames("dropzone-container", this.props.className)}>
                            {this.props.showDropzoneTarget && <div {...getRootProps({className: 'dropzone primary-text-color'})}>
                                <input {...getInputProps()} />
                                <p><i className="fas fa-cloud-upload-alt"></i></p>
                            </div>}
                            {horizontalLayout ? this.renderFilesHorizontal() :  this.renderFiles()}
                        </div>
                    )}
                </Dropzone>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedUser: AuthenticationManager.getAuthenticatedUser()
    }
}
const mergeProps = (stateProps, dispatchProps, ownProps) =>
{
    return {...ownProps, ...stateProps}
}
export default connect(mapStateToProps, undefined, mergeProps, { forwardRef:true })(FilesUpload);