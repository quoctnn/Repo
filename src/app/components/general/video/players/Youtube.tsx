import * as React from 'react';

const MATCH_URL = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&amp;]v=)|youtu\.be\/)([^""&amp;?\/ ]{11})/
export interface Props 
{
    url:string
}
interface State 
{
    
}
export default class YouTube extends React.Component<Props,State> {
    static canPlay(url) {
        return MATCH_URL.test(url)
    }

    getUrlId(url) {
        var match = url.match(MATCH_URL);
        return (match) ? match[1] : false;
    }

    getUrl(url) {
        let idVideo = this.getUrlId(url);
        if (idVideo) {
            return `//youtube.com/embed/${idVideo}`
        }
    }

    render() {
        const style = {width: '100%', height: '300px'};
        return (
            <iframe frameBorder='0' style={style}
                    src={this.getUrl(this.props.url)}
                    allowFullScreen></iframe>
        );
    }
}