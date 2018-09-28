import * as React from "react";
import * as ReactDOM from "react-dom";
import * as PhotoSwipeGallery from "react-photoswipe/lib/PhotoSwipeGallery";
import Constants from '../../../utilities/Constants';
import { FormattedMessage } from "react-intl";
require("react-photoswipe/lib/photoswipe.css");

var pswpInstance = null;

function imageLoadComplete(pswp) {
    // Save the Photoswipe instance after opening an image. See getImageURLForShare
    pswpInstance = pswp
}
export interface GalleryImage 
{
    src: string
    thumbnail: string
    w: number
    h: number
    id:number
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