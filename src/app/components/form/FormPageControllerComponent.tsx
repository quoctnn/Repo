import * as React from 'react';
import { FormGroup, Input } from 'reactstrap';
import { FormComponentArgument, FormComponentBase } from './FormController';
import Cropper, {Location, Area} from 'react-easy-crop'
import Button from 'reactstrap/lib/Button';
import { translate } from '../../localization/AutoIntlProvider';
import { SecureImage } from '../general/SecureImage';
import { ContextNaturalKey, CropRect, CropInfo } from '../../types/intrasocial_types';
import {ApiClient} from '../../network/ApiClient';
import LoadingSpinner from '../LoadingSpinner';
import classnames = require('classnames');

const cropRectToArea = (crop:CropRect) => {
    return {x:crop.top_left[0], y:crop.top_left[1], width:crop.bottom_right[0] - crop.top_left[0] , height:crop.bottom_right[1] - crop.top_left[1]}
}

const createImage = (url:string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
export async function getCroppedImg(imageSrc:string, pixelCrop:Area):Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
  
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )
  
    // As Base64 string 
    return canvas.toDataURL('image/jpeg')
}
type FormComponentBasePropsState = {
    value?:string
}
export class TextInput extends React.Component<FormComponentArgument, FormComponentBasePropsState> implements FormComponentBase{
    constructor(props:FormComponentArgument){
        super(props)
        this.state = {
            value:this.props.value || ""
        }
    }
    getValue = () => {
        return this.state.value
    }
    isValid = () => {
        return this.props.isRequired ? this.state.value.length > 0 : true
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return {value}
        }, this.sendValueChanged)
    }
    render = () => {
        return <div key={this.props.id} className="form-text-input">
                <FormGroup className="">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                    </label>
                    <div className="">
                        <Input id={this.props.id} value={this.state.value} type="text" onChange={this.handleInputChange} placeholder={this.props.placeholder}/>
                    </div>
                </FormGroup>
            </div>
    }
}
export class TextAreaInput extends React.Component<FormComponentArgument, FormComponentBasePropsState> implements FormComponentBase{
    constructor(props:FormComponentArgument){
        super(props)
        this.state = {
            value:this.props.value || ""
        }
    }
    getValue = () => {
        return this.state.value
    }
    isValid = () => {
        return this.props.isRequired ? this.state.value.length > 0 : true
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return {value}
        }, this.sendValueChanged)
    }
    render = () => {
        return <div key={this.props.id} className="form-text-area-input">
                <FormGroup className="">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                    </label>
                    <div className="">
                        <Input id={this.props.id} value={this.state.value} type="textarea" onChange={this.handleInputChange} placeholder={this.props.placeholder}/>
                    </div>
                </FormGroup>
            </div>
    }
}
export class PhotoUploadPreview extends React.Component<FormComponentArgument,{value:File, crop:CropRect, preview:string}> implements FormComponentBase{
    private fileUploader = React.createRef<HTMLInputElement>();
    constructor(props:FormComponentArgument){
        super(props)
        this.state = {
            value:null,
            crop: null,
            preview:props.value
        }
    }
    getValue = () => {
        if(!this.state.crop)
            return null
        const data = {file:this.state.value || this.props.value, crop:this.state.crop }
        return data
    }
    isValid = () => {
        return true
    }
    sendValueChanged = () => {
        const data = this.getValue()
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, data)
    }
    handleCropCompleted = (source:string, crop:CropRect, file?:File) => {
        this.setState(() => {
            return { value:file, crop, preview:source }
        }, this.props.onRequestNavigation)
    }
    handleCancelCrop = () => {
        this.props.onRequestNavigation()
    }
    navigateToCropper = (f?:File) => {
        const file = f || this.state.value || this.props.value
        const crop = this.state.crop
        const area:Area = crop && cropRectToArea(crop)
        const mode = this.props.id == "avatar" ? FileCropperMode.avatar : FileCropperMode.cover
        this.props.onRequestNavigation(this.props.title , <FileCropper 
                                                cancelCrop={this.handleCancelCrop} 
                                                onCropCompleted={this.handleCropCompleted} 
                                                file={file} 
                                                mode={mode}
                                                contextNaturalKey={this.props.contextNaturalKey} 
                                                contextObjectId={this.props.contextObjectId}
                                                initialCroppedAreaPixels={area}
                                                />)
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            this.navigateToCropper(file)
        }
    }
    triggerUpload = () => {
        if(this.fileUploader && this.fileUploader.current)
        {
            this.fileUploader.current.value = null
            this.fileUploader.current.click()
        }
    }
    handleImagePreviewClick = () => {
        const file = this.state.value || this.props.value
        if(!file)
            this.triggerUpload()
        else 
            this.navigateToCropper()
    }
    render = () => {
        const cn = classnames("form-photo-upload-preview", this.props.id)
        return <div key={this.props.id} className={cn}>
                <FormGroup className="">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                    </label>
                    <div className="">
                        <div className="image-preview-container" onClick={this.handleImagePreviewClick}>
                            {this.state.preview && <SecureImage url={this.state.preview} />}
                        </div>
                        <Button onClick={this.triggerUpload} className="file-upload-button" outline={true} color="secondary">
                            {translate("file.image.upload")}
                            <Input innerRef={this.fileUploader}  className="d-none" id={this.props.id} type="file" onChange={this.handleInputChange} />
                        </Button>
                    </div>
                </FormGroup>
            </div>
    }
}
export enum FileCropperMode{
    cover, avatar
}
type FileCropperDefaultProps = {
    mode:FileCropperMode
}
type FileCropperProps = {
    file:File| string
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    onCropCompleted:(preview:string, crop:CropRect, file?:File) => void
    cancelCrop:() => void
    initialCroppedAreaPixels?:Area
} & FileCropperDefaultProps
type FileCropperState = {aspect:number, loading:boolean, zoom:number, crop:Location, preview:string, initialCroppedAreaPixels?:Area}
export class FileCropper extends React.Component<FileCropperProps, FileCropperState>{
    private croppedAreaPixels:Area = null
    static defaultProps:FileCropperDefaultProps = {
        mode:FileCropperMode.avatar
    }
    constructor(props:FileCropperProps){
        super(props)
        this.state = {
            crop: { x: 0, y: 0 },
            preview:null,
            zoom:1,
            initialCroppedAreaPixels:props.initialCroppedAreaPixels,
            loading:true,
            aspect:props.mode == FileCropperMode.avatar ? 1 : 1300 / 275
        }
    }
    componentDidMount = () => {
        this.processInputFile()
    }
    handleFetchedServerData = (data:CropInfo) => {
        if(data)
        {
            this.setState((prevState:FileCropperState) => {
                const area:Area = prevState.initialCroppedAreaPixels || cropRectToArea(data)
                return {preview:data.image, initialCroppedAreaPixels:area, loading:false}
            })
        }
        else 
        {
            this.setState(() => {
                return {loading:false}
            })
        }
    }
    fetchServerData = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        switch (contextNaturalKey + this.props.mode) {
            case ContextNaturalKey.COMMUNITY + FileCropperMode.avatar:ApiClient.getCommunityAvatar(contextObjectId, this.handleFetchedServerData);break;
            case ContextNaturalKey.COMMUNITY + FileCropperMode.cover:ApiClient.getCommunityCover(contextObjectId, this.handleFetchedServerData);break;
        
            default:
                break;
        }
    }
    processInputFile = () => {
        const file = this.props.file
        if(file instanceof File)
        {
            const reader = new FileReader();
            reader.addEventListener("load", () =>
                this.setState(() => {
                    return  { preview: reader.result as string, loading:false}
                })
            )
            reader.readAsDataURL(file);
        }
        else {
            if(this.props.contextNaturalKey && this.props.contextObjectId)
            {
                this.fetchServerData(this.props.contextNaturalKey, this.props.contextObjectId)
            }
            else {
                this.setState(() => {
                    return  { preview: file, loading:false}
                })
            }
        }
    }
    onCropChange = (crop:Location) => {
        this.setState({ crop })
    }
    onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        console.log(croppedArea, croppedAreaPixels)
        this.croppedAreaPixels = croppedAreaPixels
    }
    onZoomChange = (zoom:number) => {
        this.setState({ zoom })
    }
    submitCrop = async () => {
        const area = this.croppedAreaPixels
        const crop:CropRect = {top_left:[area.x, area.y], bottom_right:[area.x + area.width, area.y + area.height]}
        const file = this.props.file instanceof File ? this.props.file : undefined
        const preview = await getCroppedImg(this.state.preview, area)
        this.props.onCropCompleted(preview, crop, file)
    }
    cancelCrop = () => {
        this.props.cancelCrop()
    }
    render = () => {
        const { crop, preview: src, zoom, aspect} = this.state
        const canSubmit = !!this.croppedAreaPixels
        const cn = classnames("crop-container", {loading:this.state.loading})
        return <div className="file-cropper">
                <div className={cn}>
                    {this.state.loading && <LoadingSpinner />}
                    {!this.state.loading && <Cropper
                            initialCroppedAreaPixels={this.state.initialCroppedAreaPixels}
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={this.onCropChange}
                            onCropComplete={this.onCropComplete}
                            onZoomChange={this.onZoomChange}
                        />}
                </div>
                <div className="d-flex flex-row-reverse mt-1">
                    <Button disabled={!canSubmit} onClick={this.submitCrop} color="primary">
                        {translate("OK")}
                    </Button>
                    <Button className="mr-1" onClick={this.cancelCrop} outline={true} color="secondary">
                        {translate("Cancel")}
                    </Button>
                </div>
            </div>
    }
}