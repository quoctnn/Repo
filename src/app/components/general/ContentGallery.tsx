import * as React from 'react';
import * as PhotoSwipe from "photoswipe"
import Swiper from "react-id-swiper";
import "react-id-swiper/src/styles/css/swiper.css"
import VideoPlayer from './video/VideoPlayer';
import { UploadedFile, UploadedFileType } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import PhotoSwipeComponent from './gallery/PhotoSwipeComponent';
import { nullOrUndefined } from '../../utilities/Utilities';
import classnames from 'classnames';
import { SecureImage } from './SecureImage';
require("./ContentGallery.scss");
export const convertToComponent = (file:UploadedFile,galleryMode?:boolean, onClick?:(file:UploadedFile, event) => void):JSX.Element => {
    const gm = nullOrUndefined( galleryMode ) ? false : galleryMode
    switch(file.type)
    {
        case UploadedFileType.IMAGE: return <GalleryImageComponent galleryMode={gm} file={file} onClick={onClick}/>
        case UploadedFileType.DOCUMENT: return <GalleryDocumentComponent galleryMode={gm} file={file} onClick={onClick}/>
        case UploadedFileType.AUDIO:
        case UploadedFileType.VIDEO: return <GalleryMediaComponent galleryMode={gm} file={file} onClick={onClick}/>
        default: return <GalleryImageComponent galleryMode={gm} file={file} onClick={onClick}/>
    }
}
type GalleryComponentProps = {
    file:UploadedFile
    onClick?:(file:UploadedFile, event) => void
    galleryMode:boolean
}
export const getFileUrl = (file:UploadedFile) => {
    return IntraSocialUtilities.appendAuthorizationTokenToUrl(file.file)
}
export const getImageUrl = (file:UploadedFile, preferFullVersion:boolean) => {

    let img = preferFullVersion ? file.image : file.thumbnail
    if(!img) // pick any if not found
        img = file.image || file.thumbnail
    return img
} 
export class GalleryImageComponent extends React.Component<GalleryComponentProps, {}> {
    onClick = (event:any) => {
        if(this.props.onClick)
            this.props.onClick(this.props.file, event)
    }
    render = () => {
        const cn = classnames("gallery-item gallery-file-item gallery-image-item hover-card drop-shadow", this.props.file.type, this.props.file.extension)
        const img = getImageUrl(this.props.file, false)
        return (<div key={"image_" + this.props.file.id} onClick={this.onClick} className={cn}>
                    <SecureImage url={img} className="img-responsive" />
                </div>)
    }
}

export class GalleryDocumentComponent extends React.Component<GalleryComponentProps, {}> {
    render = () => {
        const cn = classnames("gallery-item gallery-file-item gallery-document-item hover-card drop-shadow", this.props.file.type, this.props.file.extension)
        const img = getImageUrl(this.props.file, false)
        const url = getFileUrl(this.props.file)
        return <a key={"document_" + this.props.file.id} className={cn} href={url} target="_blank">
                    {img && <SecureImage url={img} className="img-responsive" />}
                    {!img && <i className="fa file-icon"></i>}
                    <div className="document-preview-footer">
                        <h4 className="text-truncate m-2 primary-text">
                            <i className="fa file-icon mr-1"></i>
                            {this.props.file.filename}
                        </h4>
                    </div>
                </a>
    }
}
export class GalleryMediaComponent extends React.Component<GalleryComponentProps, {active:boolean}> {
    constructor(props:GalleryComponentProps)
    {
        super(props)
        this.state = {
            active:false
        }
    }
    onClick = (event) => {
        if(!this.state.active)
        {
            this.setState({active:true})
        }
    }
    render = () => {
        const cn = classnames("gallery-item gallery-file-item gallery-media-item hover-card drop-shadow", this.props.file.type, this.props.file.extension, {active:this.state.active})
        const active = this.state.active
        const poster = getImageUrl(this.props.file, false)
        const url = getFileUrl(this.props.file)
        const extension = this.props.file.extension
        return <div key={"media_" + this.props.file.id} className={cn} onClick={this.onClick}>
                    {active && <VideoPlayer autoPlay={true} poster={poster} link={url} extension={extension}/>}
                    {!active && 
                        <div className="poster-container">
                            <SecureImage label={this.props.file.filename + " poster image"} url={poster} setBearer={false} />
                            <div className="play-button">
                                <i className="fas fa-play"></i>
                            </div>
                            
                        </div>
                    }
                </div>
    }
}
export type Point = {
    width:number 
    height:number
}
export interface OwnProps 
{
    files:UploadedFile[]
}
export interface DefaultProps 
{
    height:number
}
interface State 
{
    index:number
    visible:boolean
}
type Props = OwnProps & DefaultProps

export default class ContentGallery extends React.Component<Props, State> {     
    static defaultProps:DefaultProps = {
        height:200
    }
    windowResizeOn = false
    animationDuration = 300
    animating = false
    swiper = null
    galleryContainer = React.createRef<HTMLDivElement>();
    constructor(props:Props) {
        super(props);
        this.state = {
            index:0,
            visible:false,
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        return nextProps.height != this.props.height || 
                !nextProps.files.isEqual(this.props.files) || 
                nextState.visible != this.state.visible || 
                nextState.index != this.state.index
    }
    onDialogClose = () => 
    {
        this.setState({visible:false})
    }
    onGalleryItemClick = (file:UploadedFile, event) => 
    {
        event.preventDefault()
        let ix = this.props.files.indexOf(file)
        if(ix > -1)
        {
            this.setState({index:ix, visible:true})
        }
    }

    targetHeightForCount = (count:number) => {
        switch(count)
        {
            case 1: return 300
            case 2: return 250
            case 3: return 200
            case 4: return 150;
            default: return 100;
        }
    }
    targetWidthForCount = (count:number) => {
        switch(count)
        {
            case 1: return 400
            case 2: return 500
            case 3: return 600
            case 4: return 700;
            default: return 800;
        }
    }
    calculateSizes = (files:UploadedFile[]) => {
        //find total width at height
        //scale to specific width 
        const targetWidth = this.targetWidthForCount(files.length)
        const targetHeight = this.targetHeightForCount(files.length)
        let totalWidth = 0
        const points:Point[] = []
        files.forEach(f =>  {
            if(!f.image_width || !f.image_height)
            {
                totalWidth += targetHeight
                points.push({width:targetHeight, height:targetHeight})
                return
            }
            const scale = f.image_width / f.image_height
            let w = scale * targetHeight
            totalWidth += w
            points.push({width:w, height:targetHeight})
        })
        console.log("calc", points, totalWidth, "target:", targetWidth, targetHeight)
        //rescale
        const scale = totalWidth / targetWidth  
        const newPoints:Point[] = points.map(p => {
            return {width:p.width / scale, height:p.height / scale}
        })
        const maxWidth = Math.min( targetWidth * scale , targetWidth) 
        console.log("rescale", newPoints, scale, maxWidth)
        return {points:newPoints, maxWidth:maxWidth, width:targetWidth, height:targetHeight / scale }
    }
    renderModal = () => 
    {
        if(!this.state.visible)
            return null
        const options:PhotoSwipe.Options = {index:this.state.index, getThumbBoundsFn:(index) => {
            const child = (this.swiper && this.swiper.wrapperEl || this.galleryContainer && this.galleryContainer.current).children[index]
            if(child)
            {
                const rect = child.getBoundingClientRect()
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width}
            }
            return null
        }}
        return <PhotoSwipeComponent items={this.props.files} options={options} visible={this.state.visible} onClose={this.onDialogClose}/>
    }
    renderItems = (files:UploadedFile[], setSizes:boolean = false) => 
    {
        if(files.length == 0)
            return null
        const items = files.map(f => {
            const item = convertToComponent(f, false, this.onGalleryItemClick)
            const scale = f.image_width && f.image_height ? (f.image_width / f.image_height) : 1
            const styles = setSizes ? {width: this.props.height * scale, height:this.props.height } : undefined
            return <div key={f.type + "_" + f.id} className="gallery-item-container" style={styles}>{item}</div>
        })  
        return items
    }
    renderSingleItem = () => {

        const files = this.props.files
        const sizes = this.calculateSizes(files)
        const height = sizes.height * 100 / sizes.width
        const items = this.renderItems(files)
        return (<div className="gallery-container" style={{ maxWidth:sizes.maxWidth}}>
                    <div ref={this.galleryContainer} style={{paddingBottom:height + "%"}} className={"gallery-list"}>
                        {items}
                    </div>
                </div>)
    }
    renderMultipleItems = () => {

        const items = this.renderItems(this.props.files, true)
        const params = {
            slidesPerView: "auto",
            spaceBetween: 10,
            freeMode: true,
            shouldSwiperUpdate:true,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            style:{height:this.props.height}
          }
        return  (<Swiper ref={(node) => {if(node) this.swiper = node.swiper}  } {...params}>
                    {items}
                </Swiper>)
    }
    render()
    {
        const items = this.props.files
        const styles:React.CSSProperties = {}
        if(items.length > 1)
            styles.height = this.props.height
        return (<>
                    <div className="content-gallery" style={styles}>
                        {items.length > 1 && this.renderMultipleItems()}
                        {items.length == 1 && this.renderSingleItem()}
                    </div>
                    {this.renderModal()}
                </>)
    }
}