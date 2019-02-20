import * as PhotoSwipe from "photoswipe"
import * as PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default.js"
import "photoswipe/dist/photoswipe.css"
import "photoswipe/dist/default-skin/default-skin.css"
import * as React from 'react';
import { UploadedFile } from '../../../types/intrasocial_types';
import { convertToGalleryItem, GalleryItemType } from "../ContentGallery";
import ReactDOM = require("react-dom");

export interface Props 
{
    items:UploadedFile[]
    options:PhotoSwipe.Options 
    visible:boolean
    onClose:() => void
}
interface State 
{
    items:(PhotoSwipe.Item|any)[]
}
export default class PhotoSwipeComponent extends React.Component<Props, State> 
{     
    pswp:any = null
    gallery:any = null
    constructor(props:Props) {
        super(props);
        this.state = {
            items:this.getData(props)
        }
        this.openPhotoSwipe()
    }
    getData = (props:Props) => {

        const items:(PhotoSwipe.Item|any)[] = props.items.map(f => 
            {
                const gi = convertToGalleryItem(f, {preferThumbnail:false, totalFiles:1 })
                switch(gi.file.type)
                {
                    case GalleryItemType.IMAGE:return {msrc:gi.getImage(false), src:gi.getImage(true), w:gi.file.image_width, h:gi.file.image_height, download:gi.getUrl()}
                    case GalleryItemType.VIDEO:{
                        const el =  gi.renderFull(null)
                        var html = document.createElement('div');
                        html.classList.add("gallery-item-full-container")
                        ReactDOM.render(
                            el ,
                            html
                        )
                        return {html:html, filetype:gi.file.type, download:gi.getUrl()}
                    }
                    default:return {msrc:gi.getImage(false), src:gi.getImage(true), w:gi.file.image_width, h:gi.file.image_height, download:gi.getUrl()}
                }
            }
        )
        return items
    }
    componentWillUnmount()
    {
        this.removeGallery()
    }
    openPhotoSwipe = () => {

        this.pswp = this.createGalleryElement()
        document.body.appendChild(this.pswp)
        
        // define options (if needed)
        var options = {
            shareButtons:[{
                id: 'download',
                label: 'Download',
                url: '{{raw_image_url}}',
                download: true
            }],
            getImageURLForShare: ( shareButtonData ) =>  {
                // `shareButtonData` - object from shareButtons array
                // 
                // `pswp` is the gallery instance object,
                // you should define it by yourself
                // 
                return this.gallery.currItem.download || '';
            },
            ...this.props.options
        };
        
        // Initializes and opens PhotoSwipe
        this.gallery = new PhotoSwipe(this.pswp, PhotoSwipeUI_Default, this.state.items, options)
        this.gallery.init()
        this.gallery.listen('destroy', () => {
                this.gallery.close()
                this.gallery = null
                this.props.onClose()
        })

        this.gallery.listen('afterChange', () => { 
            const index = this.gallery.getCurrentIndex()
            if(index > 0)
            {
                const prevItem = this.state.items[index - 1]
                this.pauseMedia(prevItem)
            }
            if(index < this.state.items.length - 1)
            {
                const nextItem = this.state.items[index + 1]
                this.pauseMedia(nextItem)
            }
            console.log("afterChange", this.gallery)
        });
    }
    pauseMedia = (item:(PhotoSwipe.Item|any)) => {
        if(item.html && item.filetype && (item.filetype == GalleryItemType.VIDEO || item.filetype == GalleryItemType.VIDEO))
        {
            const medias = item.html.querySelectorAll("video, audio")
            for (let media of medias) {
                media.pause()
            }
        }
    }
    removeGallery() {
        if(this.pswp && this.pswp.parentElement)
        {
            this.pswp.parentElement.removeChild(this.pswp)
            this.pswp = null
        }
    }
    createElementFromHTML = (html:string) => {
        var div = document.createElement('div')
        div.innerHTML = html.trim()
        return div.firstChild; 
    }
    createGalleryElement = () => {
        const html = "<div class=\"pswp\" tabIndex=\"-1\" role=\"dialog\" aria-hidden=\"true\">" + 
                "<div class=\"pswp__bg\"></div>" + 

                "<div class=\"pswp__scroll-wrap\">" +
                "<div class=\"pswp__container\">" +
                "<div class=\"pswp__item\"></div>" +
                "<div class=\"pswp__item\"></div>" +
                "<div class=\"pswp__item\"></div>" +
                "</div>" +

                "<div class=\"pswp__ui pswp__ui--hidden\">" +
                "<div class=\"pswp__top-bar\">" +
                "<div class=\"pswp__counter\"></div>" +

                "<button class=\"pswp__button pswp__button--close\" title=\"Close (Esc)\"></button>" +
                "<button class=\"pswp__button pswp__button--share\" title=\"Share\"></button>" +
                "<button class=\"pswp__button pswp__button--fs\" title=\"Toggle fullscreen\"></button>" +
                "<button class=\"pswp__button pswp__button--zoom\" title=\"Zoom in/out\"></button>" +

                "<div class=\"pswp__preloader\">" +
                "<div class=\"pswp__preloader__icn\">" +
                "<div class=\"pswp__preloader__cut\">" +
                "<div class=\"pswp__preloader__donut\"></div>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</div>" +

                "<div class=\"pswp__share-modal pswp__share-modal--hidden pswp__single-tap\">" +
                "<div class=\"pswp__share-tooltip\"></div> " +
                "</div>" + 

                "<button class=\"pswp__button pswp__button--arrow--left\" title=\"Previous (arrow left)\"></button>" +

                "<button class=\"pswp__button pswp__button--arrow--right\" title=\"Next (arrow right)\"></button>" +

                "<div class=\"pswp__caption\">" +
                "<div class=\"pswp__caption__center\"></div>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</div>"
        return this.createElementFromHTML(html)
    }
    render() {
        return null
    }
}