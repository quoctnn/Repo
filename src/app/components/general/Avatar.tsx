import * as React from 'react';
import { SecureImage } from './SecureImage';
import { AvatarStatusColor, UserStatus } from '../../types/intrasocial_types';
import { UserStatusIndicator } from './UserStatusIndicator';
import "./Avatar.scss"
import { ReduxState } from '../../redux';
import { connect, DispatchProp } from 'react-redux';
import { ProfileManager } from '../../managers/ProfileManager';
import classnames from 'classnames';

type OwnProps = {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image?:string,
    images?:string[],
    innerRef?: (element:HTMLElement) => void
    userStatus?:number
    containerClassName?:string
}
type ReduxStateProps = {
    statusColor?:AvatarStatusColor,
}
type DefaultProps = ReduxStateProps & OwnProps 
type Props = DefaultProps & DispatchProp
class Avatar extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:DefaultProps = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
        statusColor:AvatarStatusColor.NONE,

    }
    imageStyles:{[key:string]:React.CSSProperties} = {}
    constructor(props:Props)
    {
        super(props)
    }
    render()
    {
        const {image, images, borderColor, borderWidth, size, children, className, statusColor, userStatus, innerRef, dispatch , containerClassName , ...rest} = this.props
        let imgs:string[] = []
        if(image)
            imgs.push(image)
        if(images)
            imgs = imgs.concat( images )
        var imgUrls = imgs/*.map(i => IntraSocialUtilities.appendAuthorizationTokenToUrl(i))*/.slice(0,4)
        const length = imgUrls.length
        const containerClass = classnames("image-container", containerClassName)
        return(
            <div {...rest} className={"avatar" + (className ? " " + className : "")} ref={this.props.innerRef} >
                <div className={containerClass} style={{borderWidth:borderWidth + "px", borderColor:borderColor, width:size + "px", height:size + "px", borderStyle:"solid"}}>
                    {imgUrls.map((img, index) => {
                        const key = `image_${length}_${index}`
                        return <SecureImage setAsBackground={true} key={key} className={"image multi " + key} url={img}></SecureImage>
                    })}
                </div>
                {children}
                {statusColor != AvatarStatusColor.NONE &&
                    <UserStatusIndicator size={15} borderColor="white" statusColor={statusColor} borderWidth={2}/>
                }
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {

    if(ownProps.userStatus)
    {
        const profile = ProfileManager.getProfileById(ownProps.userStatus)
        if(profile)
        {
            return {statusColor:UserStatus.getObject(profile.user_status).color}
        }
    }
    return {}
}
export default connect<ReduxStateProps, DispatchProp, OwnProps>(mapStateToProps, null)(Avatar)