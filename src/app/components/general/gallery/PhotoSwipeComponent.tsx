import * as PhotoSwipe from "./photoswipe"
import * as PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default.js"
import "photoswipe/dist/photoswipe.css"
import "photoswipe/dist/default-skin/default-skin.css"
import * as React from 'react';
import { UploadedFile, UploadedFileType } from '../../../types/intrasocial_types';
import { convertToComponent, getImageUrl, getFileUrl, GalleryComponent } from "../ContentGallery";
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
    allowSwipe = true
    constructor(props:Props) {
        super(props);
        const data = this.getData(props)
        this.state = {
            items:data.items,
        }
        this.openPhotoSwipe()
    }
    getData = (props:Props) => {

        const comps:{[key:string]: React.Component<GalleryComponent<any>, React.ComponentState, any>} = {}
        const items:(PhotoSwipe.Item|any)[] = props.items.map((f,i) => 
            {
                const thumbImage = getImageUrl(f, false)
                const fullImage = getImageUrl(f, true)
                const fileUrl = getFileUrl(f)
                switch(f.type)
                {
                    case UploadedFileType.IMAGE:return {msrc:thumbImage, src:fullImage, w:f.image_width, h:f.image_height, download:fileUrl}
                    case UploadedFileType.IMAGE360:
                    case UploadedFileType.AUDIO:
                    case UploadedFileType.VIDEO:{
                        var html = document.createElement('div');

                        html.classList.add("gallery-item-full-container")
                        const gi = convertToComponent(f, true, null)
                        ReactDOM.render(
                            gi ,
                            html
                        )
                        return {html:html, filetype:f.type, download:fileUrl}
                    }
                    case UploadedFileType.DOCUMENT:{
                        var html = document.createElement('div');
                        html.classList.add("gallery-item-full-container")
                        const gi = convertToComponent(f, true, null)
                        ReactDOM.render(
                            gi ,
                            html
                        )
                        return {html:html, filetype:f.type, download:fileUrl,w:f.image_width || 0, h:f.image_height || 0,}
                    }
                    default:return {msrc:thumbImage, src:fullImage, w:f.image_width, h:f.image_height, download:fileUrl}
                }
            }
        )
        return {items, comps}
    }
    componentWillUnmount()
    {
        this.removeGallery()
    }
    preventSwipe = (e) => {
        if (!this.allowSwipe) {
            e.preventDefault();
            //e.stopPropagation();
        }
    }
    setAllowSwipe = (allow:boolean) => {
        this.gallery.options.disablePanning = !allow
        this.gallery.options.allowPanToNext = allow;
        this.gallery.options.pinchToClose = allow
        this.gallery.options.closeOnScroll = allow
        this.gallery.options.closeOnVerticalDrag = allow
        this.allowSwipe = allow
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
            allowPanToNext:false,
            ...this.props.options
        };
        
        // Initializes and opens PhotoSwipe
        this.gallery = new PhotoSwipe(this.pswp, PhotoSwipeUI_Default, this.state.items, options)
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
            const item = this.state.items[index]
            if(item.filetype == UploadedFileType.IMAGE360)
            {
                this.setAllowSwipe(false)
            }
            else{
                this.setAllowSwipe(true)
            }
            console.log("afterChange", this.gallery)
        });
        this.gallery.listen('outItemSize', (item) => { 
            item.w = window.innerWidth 
            item.h = window.innerWidth * 3 / 4
            console.log("outItemSize", item)

        });
        this.gallery.listen('preventDragEvent', (e, isDown, _preventObj) => { 
            const index = this.gallery.getCurrentIndex()
            const item = this.state.items[index]
            if(item.filetype == UploadedFileType.VIDEO || item.filetype == UploadedFileType.IMAGE360)
                _preventObj.prevent = false
            
            console.log("preventDragEvent", _preventObj.prevent)

        });
        this.gallery.init()
        
    }
    pauseMedia = (item:(PhotoSwipe.Item|any)) => {
        if(item.html && item.filetype && (item.filetype == UploadedFileType.VIDEO || item.filetype == UploadedFileType.VIDEO))
        {
            const medias = item.html.querySelectorAll("video, audio")
            for (let media of medias) {
                media.pause()
            }
        }
    }
    removeGallery() {
        if(this.gallery)
        {
            this.gallery.close()
            this.gallery = null
        }
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