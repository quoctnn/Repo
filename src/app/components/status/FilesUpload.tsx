import * as React from 'react';
import { Settings } from '../../utilities/Settings';
import { UploadedFile, UploadedFileType } from '../../types/intrasocial_types';
import Dropzone from 'react-dropzone';
import Swiper from "react-id-swiper";
import * as Mime from "mime-types"
import "./FilesUpload.scss" 
import classnames = require('classnames');
import { Button } from 'reactstrap';
import { FileUploader } from '../../network/ApiClient';
import { SecureImage } from '../general/SecureImage';
import RadialProgress from '../general/loading/RadialProgress';

type FileProps<T> = {
    file:T
    onRemove:(event:React.SyntheticEvent) => void
}
const FileThumb = (props:FileProps<ExtendedFile>) => {
    const {file, onRemove} = props
    const extension =  Mime.extension(file.type)
    const type = UploadedFileType.parseFromMimeType(file.type)
    const cn = classnames("thumb-inner main-border-color-background", extension, type)
    return <div className="thumb border-1" key={file.name}>
                <div className={cn}>
                    {file.preview && 
                        <img className="img-responsive" src={file.preview} />
                        || 
                        <i className="fa file-icon"></i>
                    }
                    <Button className="remove-button" onClick={onRemove} size="xs">
                        <i className="fas fa-times"></i>
                    </Button>
                    {file.uploading && <RadialProgress className="upload-progress" percent={file.uploadPercent || 0} size={64} strokeWidth={2} />}
                </div>
            </div>
}
const UploadedFileThumb = (props:FileProps<UploadedFile>) => {
    const {file, onRemove} = props
    const cn = classnames("thumb-inner main-border-color-background", file.extension, file.type)
    const image = (file.type == UploadedFileType.IMAGE || file.type == UploadedFileType.IMAGE360) ? file.thumbnail || file.image : undefined
    return <div className="thumb border-1" key={file.filename}>
                <div className={cn}>
                    {image && 
                        <SecureImage className="img-responsive" setBearer={true} url={image}  />
                        || 
                        <i className="fa file-icon"></i>
                    }
                    <Button className="remove-button" onClick={onRemove} size="xs">
                        <i className="fas fa-times"></i>
                    </Button>
                </div>
            </div>
}
export interface OwnProps 
{
    onTempFilesChanged:(length:number) => void
    onFileRemoved?:(file:UploadedFile) => void
    communityId:number
    files?:UploadedFile[]
    className?:string
}
interface DefaultProps 
{
    maxFileSize:number
    acceptedFiles:string
}
interface ExtendedFile extends File {
    preview?:string
    uploading?:boolean
    uploadPercent?:number
    uploaded?:boolean
}
interface State 
{
    files:ExtendedFile[]
    uploadedFiles:UploadedFile[]
}
type Props = DefaultProps & OwnProps
export default class FilesUpload extends React.Component<Props, State> { 
    static defaultProps:DefaultProps = {
        maxFileSize:Settings.maxFileSize,
        acceptedFiles:Settings.allowedTypesFileUpload,
    }
    constructor(props:Props) {
        super(props)
        this.state = {
          files: [],
          uploadedFiles:props.files || []
        }
    }
    updateUploadProgress = (file:ExtendedFile, percent:number) => {
        const update = Object.assign(file, {
            uploadPercent:percent
        }) as ExtendedFile
        this.updateFile(file, update)
    }
    updateFile = (file:ExtendedFile, updatedFile:ExtendedFile) => {
        this.setState((prevState:State) => {
            const files = prevState.files
            const index = files.indexOf(file)
            if(index > -1)
            {
                files[index] = updatedFile
                return {files}
            }
            return
        })
    }
    uploadFiles = (completion:(files:UploadedFile[]) => void) => {
        const files = [...this.state.files].reverse()
        const uploadedFiles:UploadedFile[] = []
        const length = files.length
        const onComplete = (file:ExtendedFile, uploadedFile:UploadedFile) => {
            uploadedFiles.push(uploadedFile)
            uploadFile( files.pop() )
            const update = Object.assign(file, {
                uploading:false,
                uploaded:true
            }) as ExtendedFile
            this.updateFile(file, update)
        }
        const uploadFile = (file:ExtendedFile) => {
            if(!file)
            {
                completion(uploadedFiles)
                return
            }
            const update = Object.assign(file, {
                uploading:true
            }) as ExtendedFile
            this.updateFile(file, update)
            const uploader = new FileUploader(file, (percent:number) => {
                    this.updateUploadProgress(file, percent)
            })
            uploader.doUpload((uploadedFile:UploadedFile) => {
                onComplete(file, uploadedFile)
            })
        }
        if(length > 0)
        {
            uploadFile( files.pop() )
            return
        }
        completion([])
    }
    distinct = (array:ExtendedFile[]) => {
        const map = new Map<string,ExtendedFile>();
        for (const item of array) {
            if(!map.has(item.name)){
                map.set(item.name, item);
            }
        }
        return Array.from(map.values())
    }
    onDrop = (acceptedFiles:File[]) => {
        const files:ExtendedFile[] = acceptedFiles.map(f => {
            if(f.type.startsWith("image/"))
                return Object.assign(f, {
                    preview: URL.createObjectURL(f)
                })
            return f
        })
        const dist = this.distinct(this.state.files.concat(files))
        this.setState((prevState:State) => {
            return {files:dist}
        }, () => {
            this.props.onTempFilesChanged(this.state.files.length)
        })
    }
    cleanup = () => {
        const files = this.state.files
        files.forEach(file => URL.revokeObjectURL(file.preview));
    } 
    componentWillUnmount = () => {
        this.cleanup()
    }
    removeUploadedFile = (event:React.SyntheticEvent, file:UploadedFile) => {
        event.preventDefault()
        event.stopPropagation()
        this.setState((prevState:State) => {
            const files = prevState.uploadedFiles
            const index = files.indexOf(file)
            if(index > -1)
            {
                files.splice(index, 1)
                this.props.onFileRemoved(file)
            }
            return {uploadedFiles:files}
        })
    }
    removeTempFile = (event:React.SyntheticEvent,file:ExtendedFile) => {
        event.preventDefault()
        event.stopPropagation()
        this.setState((prevState:State) => {
            const files = prevState.files
            const index = files.indexOf(file)
            if(index > -1)
            {
                files.splice(index, 1)
                file.preview && URL.revokeObjectURL(file.preview)
            }
            return {files}
        }, () => {
            this.props.onTempFilesChanged(this.state.files.length)
        })
    }
    render = () => {
        const thumbs = this.state.files.map(file => {
            return  <FileThumb key={file.name + file.lastModified} onRemove={(event) => this.removeTempFile(event, file)} file={file} />
        })
        const uploadedThumbs = this.state.uploadedFiles.map(file => {
            return  <UploadedFileThumb key={file.id} onRemove={(event) => this.removeUploadedFile(event, file)} file={file} />
        })
        const params = {
            slidesPerView: 'auto',
            freeMode: true,
            shouldSwiperUpdate:true,
        }
        return <Dropzone onDrop={this.onDrop} accept={this.props.acceptedFiles}>
                    {({getRootProps, getInputProps}) => (
                        <div className="dropzone-container">
                            <div {...getRootProps({className: 'dropzone primary-text-color'})}>
                                <input {...getInputProps()} />
                                <p><i className="fas fa-cloud-upload-alt"></i></p>
                                <Swiper className="thumbs-swiper" {...params}>{thumbs}{uploadedThumbs}</Swiper>
                            </div>
                        </div>
                    )}
                </Dropzone>
    }
}