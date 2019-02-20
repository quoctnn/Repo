import * as React from 'react';

const MATCH_URL = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:ondemand\/(?:\w+\/)?|channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
export interface Props 
{
    url:string
}
interface State 
{
    
}
export default class Vimeo extends React.Component<Props,State> {
    static canPlay(url) {
        return MATCH_URL.test(url)
    }

    getUrlId(url) {
        var match = url.match(MATCH_URL);
        return (match) ? match[3] : false;
    }

    getUrl(url) {
        let idVideo = this.getUrlId(url);
        if (idVideo) {
            return `//player.vimeo.com/video/${idVideo}`
        }
    }

    render() {
        const style = {width: '100%', height: '300px'};
        return (<iframe frameBorder='0' style={style}
                        src={this.getUrl(this.props.url)}
                        allowFullScreen></iframe>);
    }
}