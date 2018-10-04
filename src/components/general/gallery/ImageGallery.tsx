import * as React from "react";
import * as ReactDOM from "react-dom";
import * as PhotoSwipeGallery from "react-photoswipe/lib/PhotoSwipeGallery";
import Constants from '../../../utilities/Constants';
import { FormattedMessage } from "react-intl";
import { UploadedFile } from '../../../reducers/conversations';
import { appendTokenToUrl, uniqueId } from '../../../utilities/Utilities';
require("react-photoswipe/lib/photoswipe.css");

var pswpInstance = null;

function imageLoadComplete(pswp) {
    // Save the Photoswipe instance after opening an image. See getImageURLForShare
    pswpInstance = pswp
}
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
    constructor(name:string,url:string, id:string)
    {
        this.name = name
        this.url = url
        this.id = id
        this.animId = uniqueId()
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
          copied.animId = uniqueId()
          copied.isClone = true
          return copied;
    }
    renderFull(onClick?:(event) => void)
    {
        return this.renderPreview(onClick)
    }
    renderPreview(onClick?:(event) => void):JSX.Element
    {
        return (<div key={this.id} onClick={onClick} className="gallery-item">
                    <a className="" href={this.url}>{this.name}</a>
                </div>)
         
    }
}
export class GalleryLink extends GalleryItem
{
    constructor(name:string,url:string, id:string)
    {
        super(name, url, id)
    }
}
export class GalleryDocument extends GalleryItem
{
    constructor(file:UploadedFile)
    {
        super(file.filename, file.file, file.id.toString())
    }
}
export class GalleryMedia extends GalleryItem
{
    constructor(file:UploadedFile)
    {
        super(file.filename, file.file, file.id.toString())
    }
}
export class GalleryImage extends GalleryItem
{
    src: string
    thumbnail: string
    w: number
    h: number
    constructor(file:UploadedFile)
    {
        super(file.filename, file.file, file.id.toString())
        let i = appendTokenToUrl( file.image )
        this.src = i
        this.thumbnail = i
        this.w = file.image_width
        this.h = file.image_height
    }
    renderPreview(onClick?: (event: any) => void )
    {
        return <div key={this.id} onClick={onClick} className="gallery-item gallery-image">
                    <img src={this.src} className="img-responsive" />
                </div>
    }
}
const photoswipeOptions = {
    'shareButtons': [
        {
            id: 'download',
            label: 'Download image',
            url: '{{raw_image_url}}',
            download: true
        }
    ],
    'getImageURLForShare': function (shareButtonData) {
        /* Set the right download url for the original file */
        if (pswpInstance != null) {
            return Constants.urlsRoute.downloadUploadedFile(pswpInstance.currItem.id)
        } else {
            return '';
        }
    },
}
export interface OwnProps 
{
    maxImagesPerRow: number
    maxRows: number
    items:GalleryImage[]
    thumbnailContent?:(item:GalleryImage) => JSX.Element
}
interface State 
{
    collapsed:boolean
}
export class ImageGallery extends React.Component<OwnProps, State> {
    static defaultProps:OwnProps = {
        maxImagesPerRow: 3,
        maxRows: 1,
        items:[],
    }
    private gallery = React.createRef<PhotoSwipeGallery>()
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true
        };

        // Auto-binding
        this.getThumbnailClass = this.getThumbnailClass.bind(this);
        this.footerEl = this.footerEl.bind(this);
        this.collapse = this.collapse.bind(this);
    }

    getThumbnailClass() {
        let items = this.props.items;

        let columns = (items.length <= this.props.maxImagesPerRow) ?
            items.length : this.props.maxImagesPerRow;
        return 'pswp-thumbnail columns-' + columns;
    }

    getThumbEl(index) {
        let galleryRefs = this.gallery.current.refs
        return ReactDOM.findDOMNode(galleryRefs['thumbnail' + index])
    }

    // Hide photos if there are more than the limit
    componentDidMount() {
        let thumbnailClass = this.getThumbnailClass();

        let max = this.props.maxImagesPerRow * this.props.maxRows;

        let getThumbItemClass = function (index) {
            if (index >= max) {
                return thumbnailClass += ' hidden';
            }
            return thumbnailClass;
        };

        let thumbnail = null;
        for (let index = 0; index < this.props.items.length; index++) {
            thumbnail = this.getThumbEl(index);
            if (thumbnail != null) {
                thumbnail.className = getThumbItemClass(index);
            }
        }
    }

    images() {
        if (this.state.collapsed) {
            return this.props.items.slice(0,3);
        } else {
            return this.props.items;
        }
    }

    collapse() {
        this.setState({collapsed: !this.state.collapsed});
    }

    footerEl() {
        let max = this.props.maxImagesPerRow * this.props.maxRows;
        let left = this.props.items.length - max;
        let buttonText = <span><i className="fa fa-minus"></i> <FormattedMessage id="feed.status.hide" defaultMessage="Hide"/></span>;

        if (this.state.collapsed) {
            buttonText = <span><i className="fa fa-plus"></i> {left} <FormattedMessage id="feed.status.images" defaultMessage="images"/></span>;
        }

        if (left > 0) {
            return (
                <div className="clearfix">
                    <button className="label label-success" onClick={this.collapse}>
                        {buttonText}
                    </button>
                </div>
            );
        }
        return "";
    }

    render() {
        return (
            <div>
                <PhotoSwipeGallery ref={this.gallery} items={this.images()}
                                   options={photoswipeOptions}
                                   imageLoadComplete={imageLoadComplete}
                                   thumbnailContent={this.props.thumbnailContent}/>
                {this.footerEl()}
            </div>
        );
    }
}