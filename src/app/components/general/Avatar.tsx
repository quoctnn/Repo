import * as React from 'react';
import { SecureImage } from './SecureImage';
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image?:string,
    images?:string[],
    stateColor?:AvatarStateColor,
}
export enum AvatarStateColor
{
    GREEN = "green",
    ORANGE = "orange",
    RED = "red", 
    GRAY = "gray",
    NONE = "none",
}
export class Avatar extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
        stateColor:AvatarStateColor.NONE,
        
    }
    imageStyles:{[key:string]:React.CSSProperties} = {}
    constructor(props:Props)
    {
        super(props)
    }
    render() 
    {
        const {image, images, borderColor, borderWidth, size, children, className, stateColor,...rest} = this.props
        let imgs:string[] = []
        if(image)
            imgs.push(image)
        if(images)
            imgs = imgs.concat( images )
        var imgUrls = imgs/*.map(i => IntraSocialUtilities.appendAuthorizationTokenToUrl(i))*/.slice(0,4)
        const length = imgUrls.length
        return(
            
            <div {...rest} className={"avatar" + (className ? " " + className : "")} >
                <div className="image-container" style={{borderWidth:borderWidth + "px", borderColor:borderColor, width:size + "px", height:size + "px", borderStyle:"solid"}}>
                    {imgUrls.map((img, index) => {
                        const key = `image_${length}_${index}`
                        return <SecureImage setAsBackground={true} key={img} className={"image multi " + key} url={img}></SecureImage>
                    })}
                </div>
                {children}
                {stateColor != AvatarStateColor.NONE && <div className={"avatar-state " + stateColor}></div>}
            </div>
        );
    }
}