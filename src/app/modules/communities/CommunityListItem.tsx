import * as React from 'react'
import classnames from "classnames"
import "./CommunityListItem.scss"
import { Community, IntraSocialType } from '../../types/intrasocial_types';
import { communityCover } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    community:Community
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class CommunityListItem extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.community != this.props.community
        return ret

    }
    render()
    {
        const {community, className, ...rest} = this.props
        const communityClass = classnames("community-list-item", className)
        const cover = communityCover(community, true)
        return (<IntraSocialLink to={community} type={IntraSocialType.community} {...rest} className={communityClass}>
                    <div className="drop-shadow">
                        <SecureImage className="img top" setBearer={true} setAsBackground={true} url={cover}/>
                        <div className="bottom d-flex align-items-center flex-row">
                            <div className="theme-box theme-bg-gradient flex-shrink-0">
                                {community.members.length || "--"}&nbsp;
                                <i className="fa fa-user"></i>
                            </div>
                            <div className="title text-truncate">{community.name}</div>
                        </div>
                    </div>
                </IntraSocialLink>)
    }
}