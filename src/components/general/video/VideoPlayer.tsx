import * as React from 'react';
import Youtube from './players/Youtube';
import Vimeo from './players/Vimeo';
import { DefaultPlayer as Video } from 'react-html5video'; 
import 'react-html5video/dist/styles.css';
import { appendTokenToUrl } from '../../../utilities/Utilities';

const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|MOV)($|\?)/i
const AUDIO_EXTENSIONS = /\.(mp3|wav)($|\?)/i
export interface Props 
{
    link:string
}
interface State 
{
    
}
export default class VideoPlayer extends React.Component<Props,State> {
    static canPlay(url) {
        return Youtube.canPlay(url) || Vimeo.canPlay(url) || VIDEO_EXTENSIONS.test(url) || AUDIO_EXTENSIONS.test(url)
    }
    getStreamingLink() 
    {
        return window.location.protocol + '//' + window.location.host + "/stream/?url=" + encodeURIComponent(this.props.link)
    }
    render() {
        if (Youtube.canPlay(this.props.link)) {
            return (<Youtube url={this.props.link}/>)

        } else if (Vimeo.canPlay(this.props.link)) {
            return (<Vimeo url={this.props.link}/>)

        } else if (VIDEO_EXTENSIONS.test(this.props.link)) {
            return (
                <div className="video-player">
                    <Video preload="auto" controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}>
                        <source src={appendTokenToUrl(this.props.link)}/>
                    </Video>
                </div>
            );
        } else if (AUDIO_EXTENSIONS.test(this.props.link)) {
            return (
                <div className="col-lg-12">
                    <audio preload="auto" controls={true}>
                        <source src={appendTokenToUrl(this.props.link)}/>
                    </audio>
                </div>
            );
        }
    }
}
