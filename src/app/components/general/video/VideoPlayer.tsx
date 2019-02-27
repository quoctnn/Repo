import * as React from 'react';
import Youtube from './players/Youtube';
import Vimeo from './players/Vimeo';
import { IntraSocialUtilities } from '../../../utilities/IntraSocialUtilities';
import VisibilitySensor from 'react-visibility-sensor';
import "./VideoPlayer.scss"
import { NotificationCenter } from '../../../utilities/NotificationCenter';
const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|MOV)($|\?)/i
const AUDIO_EXTENSIONS = /\.(mp3|wav)($|\?)/i


export type TrackableComponent = {
    isVisible:boolean
}
type DefaultProps = {

    autoPlay:boolean
    playsInline:boolean
} & TrackableComponent

type Props =
{
    link:string
    extension?:string
    poster?:string
} & DefaultProps
interface State 
{
    
}
export class GlobalMediaPlayerMananger
{
    static allowAutoplay = true
    static handleAvailableNotification = "GlobalMediaPlayerManangerHandleAvailableNotification"
    private static currentPlayingHandle:string|null = null 
    static getPlayerHandle = () => {
        if(GlobalMediaPlayerMananger.currentPlayingHandle == null)
        {
            let handle = IntraSocialUtilities.uniqueId()
            GlobalMediaPlayerMananger.currentPlayingHandle = handle
            return handle
        }
        return null
    }
    static returnPlayerHandle = (handle:string) => {
        if(GlobalMediaPlayerMananger.currentPlayingHandle == handle)
        {
            GlobalMediaPlayerMananger.currentPlayingHandle = null
            NotificationCenter.push(GlobalMediaPlayerMananger.handleAvailableNotification,[])
            return true
        }
        return false
    }
    
}
type ViewportProps = {
    onChange:(isVisible:boolean) => void
    className?:string
}
type ViewportState = {
    isVisible:boolean
}
export class ViewportObserver extends React.Component<ViewportProps,ViewportState> {
    io = null
    container = null
    constructor(props:ViewportProps) {
      super(props);
      this.state = { isVisible: false }
      this.io = null;
      this.container = null;
    }
    componentDidMount() {
        this.io = new IntersectionObserver( ([entry]) => {
            if(this.state.isVisible != entry.isIntersecting)
                this.setState({ isVisible: entry.isIntersecting }, () => {this.props.onChange(this.state.isVisible)})
        }, {})
        this.io.observe(this.container)
    }
    componentWillUnmount() {
        if (this.io) {
            this.io.disconnect()
        }
    }
    render() {
        var {onChange, children, ...rest} = this.props
      return (
        <div {...rest}
          ref={div => {
            this.container = div;
          }}
        >
          {children}
        </div>
      );
    }
  }
export default class VideoPlayer extends React.Component<Props,State> {
    videoRef = React.createRef<HTMLVideoElement>();
    static defaultProps:DefaultProps = {
        autoPlay:false,
        playsInline:true, 
        isVisible:false
    }
    static canPlay(url:string, extension?:string) {
        return (extension && VIDEO_EXTENSIONS.test("." + extension)) || Youtube.canPlay(url) || Vimeo.canPlay(url) || VIDEO_EXTENSIONS.test(url) || AUDIO_EXTENSIONS.test(url)
    }
    getStreamingLink() 
    {
        return window.location.protocol + '//' + window.location.host + "/stream/?url=" + encodeURIComponent(this.props.link)
    }
    onVisibilityChange = (isVisible:boolean) => {
        console.log("VISIBILITY CHANGED:",isVisible,  this.props.link)
        if(!isVisible)
        {
            if(this.videoRef && this.videoRef.current)
            {
                if(!this.videoRef.current.paused)
                {
                    this.videoRef.current.pause()
                }
            }
        }
    }
    render() {
        if (Youtube.canPlay(this.props.link)) {
            return (<Youtube url={this.props.link}/>)

        } else if (Vimeo.canPlay(this.props.link)) {
            return (<Vimeo url={this.props.link}/>)

        } else if ((this.props.extension && VIDEO_EXTENSIONS.test("." + this.props.extension)) || VIDEO_EXTENSIONS.test(this.props.link)) {
            const props:any = {
                disablepictureinpicture:"true",
                "x-webkit-airplay":"allow"
            }
            return (
                <ViewportObserver onChange={this.onVisibilityChange} className="video-player">
                    <video ref={this.videoRef} {...props } controlsList="nodownload" playsInline={this.props.playsInline}  autoPlay={this.props.autoPlay} poster={this.props.poster} preload="auto" controls={true}>
                        <source src={IntraSocialUtilities.appendAuthorizationTokenToUrl(this.props.link)}/>
                    </video>
                </ViewportObserver>
            );
        } else if (AUDIO_EXTENSIONS.test(this.props.link)) {
            return (
                <div className="col-lg-12">
                    <audio preload="auto" controls={true}>
                        <source src={IntraSocialUtilities.appendAuthorizationTokenToUrl(this.props.link)}/>
                    </audio>
                </div>
            );
        }
    }
}
