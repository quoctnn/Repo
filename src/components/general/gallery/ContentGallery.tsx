import * as React from 'react';
import { translate } from '../../../components/intl/AutoIntlProvider';
import VideoPlayer from '../video/VideoPlayer';
import Embedly from '../Embedly';
import { Modal, ModalBody } from 'reactstrap';
import { FileUtilities } from '../../../utilities/FileUtilities';
import { Settings } from '../../../utilities/Settings';
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption
  } from 'reactstrap';
import { IntraSocialUtilities } from '../../../utilities/IntraSocialUtilities';
import { UploadedFile } from '../../../types/intrasocial_types';
require("./ContentGallery.scss");
export enum GalleryItemType 
{
    LINK = "link",
    IMAGE = "image",
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
    NONE = "none",
}
export const parseGalleryItemType = (value:string):GalleryItemType => {
    switch(value)
    {
        case "link": return GalleryItemType.LINK
        case "image": return GalleryItemType.IMAGE
        case "document": return GalleryItemType.DOCUMENT
        case "video": return GalleryItemType.VIDEO
        case "audio": return GalleryItemType.AUDIO
        default: return GalleryItemType.NONE
    }
}
export const convertToGalleryItem = (file:UploadedFile):GalleryItem => {
    switch(file.type)
    {
        case "image": return new GalleryImage(file)
        case "document": return new GalleryDocument(file)
        case "audio":
        case "video": return new GalleryMedia(file)
        default: return new GalleryLink(file.filename, file.file, file.id.toString())
    }
}
export class GalleryItem 
{
    name:string 
    url:string
    id:string
    animId:string
    isClone:boolean
    key:string
    className:string
    canDownload:boolean = false
    constructor(name:string,url:string, id:string)
    {
        this.name = name
        this.url = url
        this.id = id
        this.animId = IntraSocialUtilities.uniqueId()
        this.isClone = false
        this.key = this.animId
    }
    clone()
    {
        var copied = Object.assign(
            Object.create(
              Object.getPrototypeOf(this)
            ),
            this
          );
          copied.animId = IntraSocialUtilities.uniqueId()
          copied.isClone = true
          return copied;
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
        return (<div key={this.id} onClick={onClick} className={"gallery-item" + (this.className ? " " + this.className : "")}>
                    <div className="gallery-container">
                        <a className="" href={this.url} target="_blank">
                            <i className="fa file-icon"></i>
                            {this.name}
                        </a>
                    </div>
                </div>)
    }
}
export class GalleryLink extends GalleryItem
{
    constructor(name:string,url:string, id:string)
    {
        super(name, url, id)
    }
    renderFull = (onClick?:(event) => void) => 
    {
        return this.renderPreview(onClick)
    }
    renderPreview = (onClick?:(event) => void) => 
    {
        return <div key={this.id} onClick={onClick}className="gallery-item gallery-item-link">
                    <Embedly url={this.url}/>
                </div> 
    }
}
export class GalleryFile extends GalleryItem
{
    size:number
    canDownload = true
    constructor(file:UploadedFile)
    {
        super(file.filename, IntraSocialUtilities.appendAuthorizationTokenToUrl(file.file), file.id.toString())
        this.size = file.size
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
        return (<div key={this.id} onClick={onClick} className={"gallery-item" + (this.className ? " " + this.className : "")}>
                    <div className={gc}>
                        {isFullVersion && <div className="file-info text-white h6">{this.name + " - " + FileUtilities.humanFileSize(this.size)}</div>}
                        <a onClick={onLinkClick} className={cn} href={this.url} target="_blank">
                            <i className="fa file-icon margin-right-sm"></i>
                            {isFullVersion ? translate("Download") : this.name}
                        </a>
                    </div>
                </div>)
    }
}
export class GalleryDocument extends GalleryFile
{
    constructor(file:UploadedFile)
    {
        super(file)
    }
}
export class GalleryMedia extends GalleryFile
{
    playerContainer = React.createRef<HTMLDivElement>();
    constructor(file:UploadedFile)
    {
        super(file)
    }
    renderFull = (onClick?:(event) => void) => 
    {
        return this.renderVideo(true, onClick)
    }
    renderPreview = (onClick?:(event) => void) => 
    {
        return this.renderVideo(true, onClick)
    }
    private renderVideo(isFullVersion:boolean, onClick?:(event) => void)
    {
        if (VideoPlayer.canPlay(this.url)) 
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
            return (<div  key={this.id} onClick={onLocalClick} className={"gallery-item gallery-video-item" + (this.className ? " " + this.className : "")}>
                        <div className="gallery-container">
                            <div ref={this.playerContainer}>
                                <VideoPlayer link={this.url}/>
                            </div>
                        </div>
                    </div>)
        }
        return super.renderFull(onClick)
    }
}
export class GalleryImage extends GalleryFile
{
    src: string
    thumbnail: string
    w: number
    h: number
    constructor(file:UploadedFile)
    {
        super(file)
        let i = IntraSocialUtilities.appendAuthorizationTokenToUrl( file.image )
        this.src = i
        this.thumbnail = i
        this.w = file.image_width
        this.h = file.image_height
    }
    renderFull(onClick?: (event: any) => void)
    {
        return this.renderPreview(onClick)
    }
    renderPreview(onClick?: (event: any) => void )
    {
        return <div key={this.id} onClick={onClick} className={"gallery-item gallery-image-item" + (this.className ? " " + this.className : "")}>
                    <img src={this.src} className="img-responsive" />
                </div>
    }
}
export interface OwnProps 
{
    files:UploadedFile[]
    links:string[]
}
export interface DefaultProps 
{
}
interface State 
{
    data:GalleryItem[]
    index:number
    visible:boolean
}
type Props = OwnProps & DefaultProps
export default class ContentGallery extends React.Component<Props, State> {     
    static defaultProps:DefaultProps = {
    }
    windowResizeOn = false
    animationDuration = 300
    animating = false

    constructor(props:Props) {
        super(props);
        this.state = {
            data:this.getContentData(props),
            index:0,
            visible:false,

        }
        this.getContentData = this.getContentData.bind(this)
        this.onGalleryItemClick = this.onGalleryItemClick.bind(this)
        this.onDialogClose = this.onDialogClose.bind(this)
    }
    arrayEqual = (arr1:any[],arr2:any[]) => 
    {
        if(!arr1  || !arr2) 
            return false
        let result;
        arr1.forEach((e1,i)=>arr2.forEach(e2=>{
            
                if(Array.isArray(e1) && Array.isArray(e2) && e1.length > 1 && e2.length)
                {
                    result = this.arrayEqual(e1,e2)
                }
                else if(e1 !== e2 )
                {
                    result = false
                }
                else
                {
                    result = true
                }
            })
        )
        return result
     }
    componentWillReceiveProps(nextProps:Props) 
    {
        const changed = !this.arrayEqual( nextProps.links , this.props.links) ||
        !this.arrayEqual(nextProps.files.map(f => f.id), this.props.files.map(f => f.id))
        if(changed)
        {
            this.setState({ data: this.getContentData(nextProps) });
        }
    }
    getContentData(props:Props)
    {
        let data:GalleryItem[] = []
        props.files.forEach(file => {
            data.push(convertToGalleryItem(file))
        })
        props.links.distinct().forEach(link => 
        {
            data.push(new GalleryLink(link, link, link))
        })
        return data
    }
    onDialogClose()
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
            return (
              <CarouselItem
                onExiting={this.onExiting}
                onExited={this.onExited}
                key={item.animId}
              >
                {item.renderFull(this.onDialogClose)}
                <CarouselCaption captionText={item.name} captionHeader={item.name} />
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
        element.setAttribute("href", dataItem.url)
        element.setAttribute("download", dataItem.name)
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
    wrapInRow = (key:number, items:any[]) => 
    {
        return <div key={key} className={"grid-row grid-columns-" + items.length}>{items}</div>
    }
    wrapInColumn = (ix:number, item) => 
    {
        return <div key={ix} className={"grid-column"}>{item}</div>
    }
    renderHorizontal = (items:any[]) => 
    {
        return items.map((i,ix) => this.wrapInColumn(ix, i))
    }
    renderVertical = (items:any[]) => 
    {
        return items.map((i,ix) => this.wrapInRow(ix,i))
    }
    renderGrid = () => 
    {
        const count = this.state.data.length
        if(count == 0)
            return null
        const items = this.state.data.slice(0, Settings.maxStatusPreviewItems)
        if(items.length == 1)
        {
            let item0 = items[0].renderPreview(this.onGalleryItemClick.bind(this, items[0]))
            return [this.wrapInRow(1, this.renderHorizontal([item0]) )]
        }
        else if (items.length == 2)
        {
            let item0 = items[0].renderPreview(this.onGalleryItemClick.bind(this, items[0]))
            let item1 = items[1].renderPreview(this.onGalleryItemClick.bind(this, items[1]))
            return [this.wrapInRow(1, this.renderHorizontal([item0,item1]))]
        }
        else if (items.length == 3)
        {
            let item0 = items[0].renderPreview(this.onGalleryItemClick.bind(this, items[0]))
            let item1 = items[1].renderPreview(this.onGalleryItemClick.bind(this, items[1]))
            let item2 = items[2].renderPreview(this.onGalleryItemClick.bind(this, items[2]))
            return [
                    this.wrapInRow(1, this.renderHorizontal([item0])),
                    this.wrapInRow(2, this.renderHorizontal([item1, item2]))
                    ]
        }
        else if (items.length == 4)
        {
            let item0 = items[0].renderPreview(this.onGalleryItemClick.bind(this, items[0]))
            let item1 = items[1].renderPreview(this.onGalleryItemClick.bind(this, items[1]))
            let item2 = items[2].renderPreview(this.onGalleryItemClick.bind(this, items[2]))
            let item3 = items[3].renderPreview(this.onGalleryItemClick.bind(this, items[3]))
            return [ 
                    this.wrapInRow(1, this.renderHorizontal([item0, item1])), 
                    this.wrapInRow(2, this.renderHorizontal([item2, item3]))
                    ]
        }
        else if (items.length == 5)
        {
            let item0 = items[0].renderPreview(this.onGalleryItemClick.bind(this, items[0]))
            let item1 = items[1].renderPreview(this.onGalleryItemClick.bind(this, items[1]))
            let item2 = items[2].renderPreview(this.onGalleryItemClick.bind(this, items[2]))
            let item3 = items[3].renderPreview(this.onGalleryItemClick.bind(this, items[3]))
            let item4 = items[4].renderPreview(this.onGalleryItemClick.bind(this, items[4]))
            if(count > Settings.maxStatusPreviewItems)
            {
                item4 = (<>
                            {item4}
                            <div className="additional-items-count">
                                {"+" + (count - Settings.maxStatusPreviewItems)}
                            </div>
                        </>)
            }
            return [ 
                    this.wrapInRow(1, this.renderHorizontal([item0, item1])), 
                    this.wrapInRow(2, this.renderHorizontal([item2, item3, item4]) )
                    ]
        }
        else 
        {
            throw new Error("LAYOUT NOT SUPPORTED")
        }
    }
    render()
    {
        let gridRows = this.renderGrid()
        return (<> 
                    {gridRows && gridRows.length > 0 && <div className={"content-gallery grid-rows-" + gridRows.length}>
                        {gridRows}
                    </div>}
                    {this.renderModal()}
                </>)
    }
}