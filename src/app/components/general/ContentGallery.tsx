import * as React from 'react';
import { Modal, ModalBody } from 'reactstrap'
import * as PhotoSwipe from "photoswipe"
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption
  } from 'reactstrap';
import VideoPlayer from './video/VideoPlayer';
import { UploadedFile } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { translate } from '../../localization/AutoIntlProvider';
import { Settings } from '../../utilities/Settings';
import { FileUtilities } from '../../utilities/FileUtilities';
import PhotoSwipeComponent from './gallery/PhotoSwipeComponent';
require("./ContentGallery.scss");
type GalleryItemSettings = {
    styles?: React.CSSProperties
    preferThumbnail:boolean
    totalFiles:number
    overflowedItems?:number
}
export enum GalleryItemType 
{
    IMAGE = "image",
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
    NONE = "none",
}
export const parseGalleryItemType = (value:string):GalleryItemType => {
    switch(value)
    {
        case "image": return GalleryItemType.IMAGE
        case "document": return GalleryItemType.DOCUMENT
        case "video": return GalleryItemType.VIDEO
        case "audio": return GalleryItemType.AUDIO
        default: return GalleryItemType.NONE
    }
}
export const convertToGalleryItem = (file:UploadedFile, settings:GalleryItemSettings):GalleryItem => {
    switch(file.type)
    {
        case "image": return new GalleryImage(file, settings)
        case "document": return new GalleryDocument(file, settings)
        case "audio":
        case "video": return new GalleryMedia(file, settings)
        default: return new GalleryItem(file, settings)
    }
}
export class GalleryItem 
{
    className:string
    key:string
    animId:string
    file:UploadedFile
    settings:GalleryItemSettings
    canDownload:boolean = false
    constructor(file:UploadedFile, settings:GalleryItemSettings)
    {
        this.file = file
        this.animId = IntraSocialUtilities.uniqueId()
        this.key = this.animId
        this.settings = settings
    }
    getUrl = () => {
        return IntraSocialUtilities.appendAuthorizationTokenToUrl(this.file.file)
    }
    getImage = (isFullVersion:boolean) => {

        let img = isFullVersion || !this.settings.preferThumbnail ? this.file.image : this.file.thumbnail
        if(!img) // pick any if not found
            img = this.file.image || this.file.thumbnail
        if(!img)
            return null
        return IntraSocialUtilities.appendAuthorizationTokenToUrl(img)
    } 
    renderOverflowedItem = () => {
        if(this.settings.overflowedItems)
            return (<div className="overflow">
                        <div>{ "+" + this.settings.overflowedItems}</div>
                    </div>)
        return null
    }
    renderFull(onClick?:(event) => void)
    {
        return this.render(true, onClick)
    }
    renderPreview(onClick?:(event) => void):JSX.Element
    {
        return this.render(false, onClick)
    }
    private render(isFullVersion:boolean, onClick?:(event) => void)
    {
        const style = isFullVersion ? undefined : this.settings.styles
        const name = this.file.filename
        const url = this.getUrl()
        return (<div style={style} key={this.key} onClick={onClick} className={"gallery-item" + (this.className ? " " + this.className : "")}>
                    <div className="gallery-container">
                        <a className="" href={url} target="_blank">
                            <i className="fa file-icon"></i>
                            {name}
                        </a>
                    </div>
                    {!isFullVersion && this.renderOverflowedItem()}
                </div>)
    }
}
export class GalleryFile extends GalleryItem
{
    canDownload = true
    constructor(file:UploadedFile, settings:GalleryItemSettings)
    {
        super(file, settings)
        this.className = file.type + " gallery-file-item " + file.extension
    }
    renderFull(onClick?:(event) => void)
    {
        return this.renderFile(true, onClick)
    }
    renderPreview(onClick?:(event) => void):JSX.Element
    {
        return this.renderFile(false, onClick)
    }
    private renderFile(isFullVersion:boolean, onClick?:(event) => void)
    {
        const cn = isFullVersion ? "btn btn-primary" : ""
        const gc = "gallery-container" + (isFullVersion ?  " text-center" : "")

        const onLinkClick = (event:React.SyntheticEvent) =>
        {
            if(isFullVersion)
                event.stopPropagation()
        }
        const style = isFullVersion ? undefined : this.settings.styles
        const name = this.file.filename
        const url = this.getUrl()
        const image = this.getImage(isFullVersion)
        return (<div style={style} key={this.key} onClick={onClick} className={"gallery-item" + (this.className ? " " + this.className : "")}>
                   {!image && <div className={gc}>
                        {isFullVersion && <div className="file-info text-white h6">{name + " - " + FileUtilities.humanFileSize(this.file.size)}</div>}
                        <a onClick={onLinkClick} className={cn} href={url} target="_blank">
                            {isFullVersion ? translate("Download") : name}
                        </a>
                    </div>
                   }
                    {image && <img src={image} className="img-responsive" />}
                    <div className="file-type">
                        <i className="fa file-icon"></i>&nbsp;{this.file.extension.toUpperCase()}
                    </div> 
                    {!isFullVersion && this.renderOverflowedItem()}
                </div>)
    }
}
export class GalleryDocument extends GalleryFile
{
    constructor(file:UploadedFile, settings:GalleryItemSettings)
    {
        super(file, settings)
    }
}
export class GalleryMedia extends GalleryFile
{
    playerContainer = React.createRef<HTMLDivElement>();
    constructor(file:UploadedFile, settings:GalleryItemSettings)
    {
        super(file, settings)
    }
    renderFull = (onClick?:(event) => void) => 
    {
        return this.renderVideo(true, onClick)
    }
    renderPreview = (onClick?:(event) => void) => 
    {
        return this.renderVideo(false, onClick)
    }
    private renderVideo(isFullVersion:boolean, onClick?:(event) => void)
    {
        const url = this.file.file
        const extension = this.file.extension
        if (VideoPlayer.canPlay(url, extension)) 
        {
            const onLocalClick = (event:React.SyntheticEvent) =>
            {
                if(isFullVersion && this.playerContainer && this.playerContainer.current && this.playerContainer.current.contains(event.target as any))
                {
                    return
                }
                if(onClick)
                {
                    onClick(event)
                }
            }
            const style = isFullVersion ? undefined : this.settings.styles
            return (<div style={style}  key={this.key} onClick={onLocalClick} className={"gallery-item gallery-video-item" + (this.className ? " " + this.className : "")}>
                        <div className="gallery-container" ref={this.playerContainer}>
                            <VideoPlayer link={url} extension={extension}/>
                        </div>
                    {!isFullVersion && this.renderOverflowedItem()}
                    </div>)
        }
        if(isFullVersion)
            return super.renderFull(onClick)
        else 
            return super.renderPreview(onClick)
    }
}
export class GalleryImage extends GalleryFile
{
    constructor(file:UploadedFile, settings:GalleryItemSettings)
    {
        super(file, settings)
    }
    renderFull(onClick?: (event: any) => void)
    {
        return this.renderItem(true, onClick)
    }
    renderPreview(onClick?: (event: any) => void)
    {
        return this.renderItem(false, onClick)
    }
    renderItem = (isFullVersion:boolean, onClick?: (event: any) => void) => {
        const style = isFullVersion ? undefined : this.settings.styles
        let img = this.getImage(isFullVersion)
        return <div style={style} key={this.key} onClick={onClick} className={"gallery-item gallery-image-item" + (this.className ? " " + this.className : "")}>
                    <img src={img} className="img-responsive" />
                    {!isFullVersion && this.renderOverflowedItem()}
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
}
interface State 
{
    data:GalleryItem[]
    index:number
    visible:boolean
    width:number
    height:number
}
type Props = OwnProps & DefaultProps

export default class ContentGallery extends React.Component<Props, State> {     
    static defaultProps:DefaultProps = {
    }
    windowResizeOn = false
    animationDuration = 300
    animating = false

    galleryContainer = React.createRef<HTMLDivElement>();
    constructor(props:Props) {
        super(props);
        const d = this.getContentData(props)
        this.state = {
            data:d.items,
            index:0,
            visible:false,
            width:d.width,
            height:d.height,
        }
        this.getContentData = this.getContentData.bind(this)
        this.onGalleryItemClick = this.onGalleryItemClick.bind(this)
    }
    componentWillReceiveProps(nextProps:Props) 
    {
        const changed = !nextProps.files.map(f => f.id).isEqual(this.props.files.map(f => f.id))
        if(changed)
        {
            const d = this.getContentData(nextProps)
            this.setState({ data: d.items, width:d.width, height:d.height });
        }
    }
    getContentData(props:Props)
    {
        const totalFiles = props.files.length
        const files = props.files
        const sizes = this.calculateSizes(files.slice(0, Settings.maxStatusPreviewItems))
        const overflowedItems = totalFiles - Settings.maxStatusPreviewItems
        let items:GalleryItem[] = []
        const preferThumbnail = files.length > 2
        let pos = 0
        files.forEach((f,i) => {
            const isPreview = i <= Settings.maxStatusPreviewItems - 1
            let styles:React.CSSProperties = undefined
            let overflowed:number = undefined
            if(isPreview)
            {
                const size = sizes.points[i]
                const width = (size.width * 100 / sizes.width)
                styles =  {width: width + "%", height:"100%", left: pos + "%"}
                pos += width
                overflowed = i == Settings.maxStatusPreviewItems - 1 && overflowedItems > 0 ? overflowedItems: undefined
            }
            const item = convertToGalleryItem(f, {styles:styles, preferThumbnail:preferThumbnail, totalFiles, overflowedItems:overflowed })
            items.push(item)
        })
        return {items: items, width:sizes.width, height:sizes.height * 100 / sizes.width  }
    }
    onDialogClose = () => 
    {
        this.setState({visible:false})
    }
    onGalleryItemClick(item, event)
    {
        event.preventDefault()
        let ix = this.state.data.indexOf(item)
        if(ix > -1)
        {
            this.setState({index:ix, visible:true})
        }
    }
    getPageItems = (index:number) => 
    {
        let data = this.state.data
        let arr:number[] = []
        if(data.length == 1)
        {
            arr.push(0)
            return arr
        }
        return [index > 0 ? index - 1: this.state.data.length - 1, index, index == this.state.data.length - 1 ? 0 :index + 1] 
    }
    onExiting = () => 
    {
        this.animating = true;
    }
    
    onExited = () =>  {
        this.animating = false;
    }
    
    next = () => {
        if (this.animating) return;
        const nextIndex = this.state.index === this.state.data.length - 1 ? 0 : this.state.index + 1;
        this.setState({ index: nextIndex });
    }
    
    previous = () =>  {
        if (this.animating) return;
        const nextIndex = this.state.index === 0 ? this.state.data.length - 1 : this.state.index - 1;
        this.setState({ index: nextIndex });
    }

    goToIndex = (newIndex:number) => {
        if (this.animating) return;
        this.setState({ index: newIndex });
    }
    renderSlides = () => 
    {
        const slides = this.state.data.map((item) => {
            const name = item.file.filename
            return (
              <CarouselItem
                onExiting={this.onExiting}
                onExited={this.onExited}
                key={item.animId}
              >
                {item.renderFull(this.onDialogClose)}
                <CarouselCaption captionText={name} captionHeader={name} />
              </CarouselItem>
            );
          });
        return (<Carousel
            activeIndex={this.state.index}
            next={this.next}
            previous={this.previous}
            interval={false}
          >
            <CarouselIndicators items={this.state.data} activeIndex={this.state.index} onClickHandler={this.goToIndex} />
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
          </Carousel>)
    }
    downloadCurrent = (event:React.SyntheticEvent) => {
        event.preventDefault()
        const dataItem = this.state.data[this.state.index]
        var element = document.createElement("a")
        element.setAttribute("href", dataItem.getUrl())
        element.setAttribute("download", dataItem.file.filename)
        element.setAttribute("target", "_blank")
        element.setAttribute("crossOrigin", "anonymous")
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }
    renderModal = () => 
    {
        if(!this.state.visible)
            return null
        const options:PhotoSwipe.Options = {index:this.state.index, getThumbBoundsFn:(index) => {
            const child = this.galleryContainer.current.children[index]
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
    renderModal2 = () => 
    {
        if(!this.state.visible)
        {
            return null
        }
        const dataItem = this.state.data[this.state.index]
        return <Modal modalClassName="fade-scale" centered={true} zIndex={1070} isOpen={this.state.visible} fade={false} toggle={this.onDialogClose} className="content-gallery-lightbox">
            <ModalBody>
                <nav className="navbar navbar-dark bg-dark">
                    <button disabled={!dataItem.canDownload} onClick={this.downloadCurrent} className="btn btn-outline-info">
                        <i className="fas fa-download"></i>
                    </button>
                </nav>
                <div className="slider-wrapper">
                    {this.renderSlides()}
                </div>
            </ModalBody>
          </Modal>
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
        console.log("rescale", newPoints, scale)
        return {points:newPoints, width:targetWidth, height:targetHeight / scale }
    }
    renderItems = () => 
    {
        const count = this.state.data.length
        if(count == 0)
            return null
        const items = this.state.data.slice(0, Settings.maxStatusPreviewItems).map(i => i.renderPreview(this.onGalleryItemClick.bind(this, i)))
        return items
    }
    render()
    {
        let items = this.renderItems()
        return (<> 
                    <div className="content-gallery ">
                            <div className="gallery-container" style={{ maxWidth:this.state.width}}>
                                {items && items.length > 0 && 
                                    <div ref={this.galleryContainer} style={{paddingBottom:this.state.height + "%"}} className={"gallery-list grid-items-" + items.length}>
                                    {items}
                                    </div>
                                }
                            </div>
                    </div>
                    {this.renderModal()}
                </>)
    }
}