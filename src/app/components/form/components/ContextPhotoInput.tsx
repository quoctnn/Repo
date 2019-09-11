
import * as React from 'react';
import Cropper, {Location, Area} from 'react-easy-crop'
import Button from 'reactstrap/lib/Button';
import { SecureImage } from '../../general/SecureImage';
import { ContextNaturalKey, CropRect, CropInfo, ContextPhotoType } from '../../../types/intrasocial_types';
import {ApiClient} from '../../../network/ApiClient';
import LoadingSpinner from '../../LoadingSpinner';
import { FormComponentBase, FormComponentRequiredMessage, FormComponentErrorMessage } from '../FormController';
import { FormComponentData, FormComponentBaseProps } from '../definitions';
import { translate } from '../../../localization/AutoIntlProvider';
import { InputGroup, Input } from 'reactstrap';
import classnames from 'classnames';
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
export class ContextPhotoInputData extends FormComponentData implements ContextPhotoInputProps{
    value:string
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    constructor(value:string, title:string, id:string, contextNaturalKey?:ContextNaturalKey, contextObjectId?:number, isRequired?:boolean){
        super(title, id, isRequired)
        this.value = value
        this.contextNaturalKey = contextNaturalKey
        this.contextObjectId = contextObjectId
    }
}
export type ContextPhotoInputProps = {
    value:string
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
} & FormComponentBaseProps
export type ContextPhotoInputState = {
    value:File, crop:CropRect, preview:string
}
export class ContextPhotoInput extends React.Component<ContextPhotoInputProps,ContextPhotoInputState> implements FormComponentBase{
    private fileUploader = React.createRef<HTMLInputElement>();
    constructor(props:ContextPhotoInputProps){
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
        const mode = this.props.id == "avatar" ? ContextPhotoType.avatar : ContextPhotoType.cover
        this.props.onRequestNavigation(this.props.title , <FileCropper 
                                                cancelCrop={this.handleCancelCrop} 
                                                onCropCompleted={this.handleCropCompleted} 
                                                file={file} 
                                                type={mode}
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
    getError = () => {
        return this.props.error  
    }
    render = () => {
        const cn = classnames("form-photo-upload-preview", this.props.id)
        const error = this.getError()
        const errorCn = classnames({"d-block":!!error})
        return <div key={this.props.id} className={cn}>
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage error={error} className={errorCn}/>
                    <div className="">
                        <div className="image-preview-container" onClick={this.handleImagePreviewClick}>
                            {this.state.preview && <SecureImage url={this.state.preview} />}
                        </div>
                        <Button onClick={this.triggerUpload} className="file-upload-button mt-1" outline={true} color="secondary">
                            {translate("file.image.upload")}
                            <Input innerRef={this.fileUploader}  className="d-none" id={this.props.id} type="file" onChange={this.handleInputChange} />
                        </Button>
                    </div>
                </InputGroup>
            </div>
    }
}
type FileCropperDefaultProps = {
    type:ContextPhotoType
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
        type:ContextPhotoType.avatar
    }
    constructor(props:FileCropperProps){
        super(props)
        this.state = {
            crop: { x: 0, y: 0 },
            preview:null,
            zoom:1,
            initialCroppedAreaPixels:props.initialCroppedAreaPixels,
            loading:true,
            aspect:props.type == ContextPhotoType.avatar ? 1 : 1300 / 275
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
        ApiClient.getContextPhoto(this.props.type, contextNaturalKey, contextObjectId,  this.handleFetchedServerData)
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