import * as React from 'react'
import classnames from "classnames"
import "./GroupListItem.scss"
import { Group, IntraSocialType } from '../../types/intrasocial_types';
import { groupCover } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    group:Group
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class GroupListItem extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
            
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.group != this.props.group
        return ret

    }
    render()
    {
        const {group, className, children, ...rest} = this.props
        const groupClass = classnames("group-list-item", className)
        const cover = groupCover(group, true)
        return (<IntraSocialLink to={group} type={IntraSocialType.group} {...rest} className={groupClass}>
                    <div className="drop-shadow">
                        <SecureImage className="img top" setBearer={true} setAsBackground={true} url={cover}/>
                        <div className="bottom d-flex align-items-center flex-row">
                            <div className="theme-box theme-bg-gradient flex-shrink-0">
                                {group.members_count || "--"}&nbsp;
                                <i className="fa fa-user"></i>
                            </div>
                            <div className="title text-truncate">{group.name}</div>
                        </div>
                    </div>
                </IntraSocialLink>)
    }
}