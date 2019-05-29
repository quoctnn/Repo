import * as React from 'react'
import classnames from "classnames"
import "./FileListItem.scss"
import { UploadedFile, UploadedFileType } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { FileUtilities } from '../../utilities/FileUtilities';
import { SecureImage } from '../../components/general/SecureImage';
import PhotoSwipeComponent from '../../components/general/gallery/PhotoSwipeComponent';
import Button from 'reactstrap/lib/Button';
import { Progress, Badge, InputGroup, Input, InputGroupAddon } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import { nullOrUndefined } from '../../utilities/Utilities';

type InputFieldProps = {
    value:string
    onChange:(event: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?:(event: React.FocusEvent<HTMLInputElement>) => void
    placeholder?:string
    centerText?:boolean
    focusBorder?:boolean
    className?:string
    inputClassName?:string
}
export class InputField extends React.Component<InputFieldProps, {}> {
    inputRef:HTMLInputElement = null
    handlePenClick = (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.inputRef.focus()
    }
    render = () => {
        const showFocusBorder = nullOrUndefined(this.props.focusBorder) ? true : this.props.focusBorder
        const cn = classnames("input-group-transparent", this.props.className)
        const inputcn = classnames("form-control-transparent primary-text", this.props.inputClassName, {"text-center":this.props.centerText, "focus-border": showFocusBorder})
        return (<InputGroup className={cn}>
                    <Input innerRef={(ref) => this.inputRef = ref} placeholder={this.props.placeholder} tabIndex={1} className={inputcn} value={this.props.value} onChange={this.props.onChange} onBlur={this.props.onBlur} /> 
                    <InputGroupAddon onClick={this.handlePenClick} className="ml-1" addonType="append">
                        <i className="fas fa-pen"></i>
                    </InputGroupAddon>
                </InputGroup>)
    }
}

type OwnProps = {
    file:UploadedFile
    onRemove?:(file:UploadedFile) => void
    onRename?:(file:UploadedFile, name:string) => void
    onRetryUpload?:(file:UploadedFile) => void
}
type DefaultProps = {
    useLink:boolean
}
type State = {
    visible:boolean
    name:string
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement> & DefaultProps
export default class FileListItem extends React.Component<Props, State> {
    imagaRef = React.createRef<HTMLDivElement>()
    static defaultProps:DefaultProps = {
        useLink:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            visible:false,
            name:props.file.filename
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.file != this.props.file ||
                    nextState.visible != this.state.visible || 
                    nextState.name != this.state.name
        return ret
    }
    handleFileClick = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        const file = this.props.file
        if(file.custom)
        {
            event.stopPropagation()
            return
        }
        if(file.type != UploadedFileType.IMAGE && file.type != UploadedFileType.IMAGE360)
        {
            this.downloadCurrent()
        }
        else {
            this.setState({visible:true})
        }
    }
    downloadCurrent = () => {
        const file = this.props.file
        if(file.file && file.filename){
            var element = document.createElement("a")
            element.setAttribute("href", file.file)
            element.setAttribute("download", file.filename)
            element.setAttribute("target", "_blank")
            element.setAttribute("crossOrigin", "anonymous")
            element.style.display = "none"
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
        }
    }
    onModalClose = () => 
    {
        this.setState({visible:false})
    }
    renderModal = () => 
    {
        if(!this.state.visible)
            return null
        const options:PhotoSwipe.Options = {index:0, getThumbBoundsFn:(index) => {
            const child = this.imagaRef && this.imagaRef.current
            if(child)
            {
                const rect = child.getBoundingClientRect()
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width}
            }
            return null
        }}
        return <PhotoSwipeComponent items={[this.props.file]} options={options} visible={this.state.visible} onClose={this.onModalClose}/>
    }
    onFileRemove = (file:UploadedFile) => (event:React.SyntheticEvent) =>  {
        this.props.onRemove && this.props.onRemove(file)
    }
    onFileRetry = (file:UploadedFile) => (event:React.SyntheticEvent) =>  {
        this.props.onRetryUpload && this.props.onRetryUpload(file)
    }
    onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        this.setState((prevState:State) => {
            return {name:value}
        })
    }
    onNameBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const oldName = this.props.file.filename
        if(this.state.name != oldName)
        {
            this.props.onRename(this.props.file, this.state.name)
        }
    }
    renderName = () => {
        const name = this.state.name
        if(!this.props.onRename)
            return <div className="text-truncate">{name}</div>
        return <InputField inputClassName="m-0 p-0 h-auto" focusBorder={false} placeholder={translate("common.filename")} onChange={this.onNameChange} onBlur={this.onNameBlur} value={name}/>
    }
    renderContent = () => {
        const {file, onRemove, onRetryUpload} = this.props
        const fileSize = FileUtilities.humanFileSize(file.size || 0)
        const hasThumbnail = !!file.thumbnail
        return <div className="d-flex file-content drop-shadow hover-card">
                    <div ref={this.imagaRef}  className="img-container">
                        {hasThumbnail && <SecureImage className="img-responsive sec-img" setBearer={!file.custom} setAsBackground={true} url={file.thumbnail}  /> 
                        ||
                        <i className="fa file-icon"></i>
                        }
                    </div>
                    <div className="d-flex flex-grow-1 flex-column content-container">
                        {this.renderName()}
                        <div className="d-flex text-muted text-truncate align-items-center">
                            <div className="text-truncate medium-small-text">{fileSize}</div>
                            <div className="flex-grow-1 d-flex">
                            {(file.uploading || file.uploadProgress > 0) && 
                                <Progress value={file.uploadProgress} className="ml-1 mr-1 flex-grow-1" >
                                {file.uploadProgress + "%"}
                                </Progress>
                            }
                            {file.hasError && 
                                <Badge className="ml-1 mr-1" color="danger">{translate("common.upload.error")}</Badge>
                            }
                            </div>
                            {!!onRetryUpload &&
                                <Button color="link" className="retry-button" onClick={this.onFileRetry(file)} size="xs">
                                    <i className="fas fa-redo-alt"></i>
                                </Button>
                            }
                            {!!onRemove && 
                                <Button color="link" className="remove-button" onClick={this.onFileRemove(file)} size="xs">
                                    <i className="fas fa-trash-alt"></i>
                                </Button>
                            }
                            {file.type == UploadedFileType.IMAGE360 &&
                                <Badge className="badge-theme ml-1 mr-1">360</Badge>
                            }
                            <Badge className="badge-theme ml-1 mr-1">{file.extension}</Badge>
                        </div>
                    </div>
                {this.renderModal()}
                </div>
    }
    render()
    {
        const {file, className, children, onRename, onRemove, useLink, onRetryUpload,  ...rest} = this.props
        const cl = classnames("file-list-item file-item", className, file.type, file.extension)
        if(useLink)
            return (<Link onClick={this.handleFileClick} to={"#"} {...rest} className={cl}> 
                        {this.renderContent()}
                    </Link>)
        return (<div {...rest} className={cl}>{this.renderContent()}</div>)
    }
}