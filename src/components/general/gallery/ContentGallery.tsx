import * as React from 'react';
import { translate } from '../../../components/intl/AutoIntlProvider';
import { UploadedFile } from '../../../reducers/conversations';
import VideoPlayer from '../video/VideoPlayer';
import Embedly from '../Embedly';
import GoogleDocEmbedCard from '../GoogleDocEmbedCard';
import { FileUtilities } from '../../../utilities/FileUtilities';
import { GalleryItem, convertToGalleryItem, GalleryLink } from './ImageGallery';
import { Modal, ModalBody } from 'reactstrap';
//import Carousel from './Carousel';
import { uniqueId } from '../../../utilities/Utilities';
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption
  } from 'reactstrap';
require("./ContentGallery.scss");

interface ArrowProps
{
    onClick:(event) => void
}
const RightArrow = (props:ArrowProps) => {
    return (
        <div className="right-arrow" onClick={props.onClick}>
        <i className="fas fa-angle-right fa-2x" aria-hidden="true"></i>
        </div>
    );
}
const LeftArrow = (props:ArrowProps) => {
    return (
        <div className="left-arrow" onClick={props.onClick} >
            <i className="fas fa-angle-left fa-2x" aria-hidden="true"></i>
        </div>
    );
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
    translateValue:number
    pageItems:number[]
}
type Props = OwnProps & DefaultProps
export default class ContentGallery extends React.Component<Props, State> {     
    static defaultProps:DefaultProps = {
    }
    windowResizeOn = false
    animationDuration = 300
    animating = false
    constructor(props) {
        super(props);
        this.state = {
            data:this.getContentData(),
            index:0,
            visible:false,
            translateValue:0,
            pageItems:[]

        }
        this.renderLinks = this.renderLinks.bind(this)
        this.renderFiles = this.renderFiles.bind(this)
        this.renderContent = this.renderContent.bind(this)
        this.getContentData = this.getContentData.bind(this)
        this.onGalleryItemClick = this.onGalleryItemClick.bind(this)
        this.onDialogClose = this.onDialogClose.bind(this)
        this.onWindowResize = this.onWindowResize.bind(this)
    }
    componentWillUnmount()
    {
        this.setWindowResizeListener(false)
    }
    renderLinks()
    {
        return this.props.links.distinct().map(link => { 
            if (VideoPlayer.canPlay(link)) {
                return (<VideoPlayer link={link} key={link}/>);
            } else if(link.startsWith("https://docs.google.com/")){
                return (<GoogleDocEmbedCard url={link} key={link}/>);
            }
            return (<Embedly url={link} key={link}/>);
        })
    }
    renderFiles()
    {
        return this.props.files.map(file => {
            return FileUtilities.getFileRepresentation(file)
        })
    }
    renderContent()
    {
        return this.renderFiles().concat(this.renderLinks())
    }
    getContentData()
    {
        let data:GalleryItem[] = []
        this.props.files.forEach(file => {
            data.push(convertToGalleryItem(file))
        })
        this.props.links.distinct().forEach(link => 
        {
            data.push(new GalleryLink(link, link, link))
        })
        return data
    }
    onDialogClose()
    {
        this.setState({visible:false})
    }
    navigateToIndex = (index:number) => 
    {
        let pi = this.getPageItems(index)
        this.setState({index:index, visible:true, translateValue:this.translateValueForIndex(index), pageItems:pi}, this.relayoutAfterAnimation)
    }
    onGalleryItemClick(item, event)
    {
        event.preventDefault()
        let ix = this.state.data.indexOf(item)
        if(ix > -1)
        {
            this.navigateToIndex(ix)
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
    relayoutAfterAnimation = () => 
    {
        setTimeout(() => {
            this.layoutItems()
        }, this.animationDuration)
    }
    layoutItems = () => 
    {
        //console.log("layout items", this.state)
    }
    goToPrevSlide = () => 
    {
        let index = this.state.index
        if(index == 0)
        {
            this.navigateToIndex(this.state.data.length - 1)
            return
        }
        let newIndex = index - 1
        this.navigateToIndex(newIndex)
    }
    slideWidth = () => {
        return window.innerWidth
    }
    goToNextSlide = () => 
    {
        let index = this.state.index
        if(index == this.state.data.length - 1) 
        {
            this.navigateToIndex(0)
            return
        }
        let newIndex = index + 1
        this.navigateToIndex(newIndex)
    }
    translateValueForIndex = (index:number) =>
    {
        return -this.slideWidth() * index
    }
    renderSlides2()
    {
        console.log(this.state.pageItems)
        const items = this.state.pageItems.map(ix => this.state.data[ix])
        const ignoreTranslate = items.length == 1
        return items.map((galleryItem, index) =>
            <div style={{ transform: `translate3d(${ignoreTranslate ? 0 : -this.slideWidth() * -(index - 1) }px, 0px, 0px) scale3d(1, 1, 1)`, transition: `transform ease-in-out ${this.animationDuration}ms`}} key={galleryItem.animId} onClick={this.onDialogClose} className={"gallery-item " + galleryItem.constructor.name.toLocaleLowerCase()}>{galleryItem.renderFull()}</div>
        )
    }
    /* renderSlides = () => 
    {
        return (<Carousel className="carousel" position={this.state.index}>
            {this.state.data.map((galleryItem, index) =>
                <React.Fragment key={galleryItem.animId}>
                    {galleryItem.renderFull(this.onDialogClose)}
                </React.Fragment>
            )}
        </Carousel>)
    } */
    onExiting = () => {
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
          >
            <CarouselIndicators items={this.state.data} activeIndex={this.state.index} onClickHandler={this.goToIndex} />
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
          </Carousel>)
    }
    setWindowResizeListener(on:boolean)
    {
        if(on && !this.windowResizeOn)
            window.addEventListener("resize", this.onWindowResize)
        else if (!on && this.windowResizeOn)
            window.removeEventListener("resize", this.onWindowResize)
    }
    onWindowResize()
    {
        this.setState({translateValue:this.translateValueForIndex(this.state.index)})
    }
    renderModal()
    {
        if(!this.state.visible)
        {
            return null
        }
        return <Modal modalClassName="fade-scale" centered={true} zIndex={1070} isOpen={this.state.visible} fade={false} toggle={this.onDialogClose} className="content-gallery-lightbox">
            <ModalBody>
                <div>TEst</div>
                <div className="slider-wrapper">
                    {this.renderSlides()}
                </div>
            </ModalBody>
          </Modal>
    }
    render()
    {
        return (<div className="content-gallery">
                {this.state.data.map(d => {
                    let eventHandler = this.onGalleryItemClick.bind(this,d)
                    return d.renderPreview(eventHandler)
                })}
                {this.renderModal()}
            </div>)
    }
}