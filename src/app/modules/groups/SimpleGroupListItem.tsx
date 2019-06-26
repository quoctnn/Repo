import * as React from 'react'
import classnames from "classnames"
import "./GroupListItem.scss"
import { Group, ContextNaturalKey } from '../../types/intrasocial_types';
import { groupCover } from '../../utilities/Utilities';
import { SecureImage } from '../../components/general/SecureImage';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    group:Group
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class SimpleGroupListItem extends React.Component<Props, State> {  
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
        return (<IntraSocialLink to={group} type={ContextNaturalKey.GROUP} {...rest} className={groupClass}>
                    <div className="title text-truncate">{group.name}</div>
                </IntraSocialLink>)
    }
}