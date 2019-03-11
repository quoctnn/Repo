import * as React from "react";
import "./StatusBadgeList.scss"
import classnames from 'classnames';
import { ObjectAttributeType } from "../../types/intrasocial_types";
export enum ObjectAttributeTypeExtension {
    read = "read"
} 
interface OwnProps 
{
    className?:string
    setting:(ObjectAttributeType | ObjectAttributeTypeExtension)[]
}
const statusBadgeIcons = {
    
}
statusBadgeIcons[ObjectAttributeType.reminder] = "far fa-bell"
statusBadgeIcons[ObjectAttributeType.attention] = "fas fa-exclamation-triangle"
statusBadgeIcons[ObjectAttributeType.important] = "far fa-star"
statusBadgeIcons[ObjectAttributeType.pinned] = "fas fa-thumbtack"
statusBadgeIcons[ObjectAttributeTypeExtension.read] = "far fa-eye"
type Props = OwnProps
export class StatusBadgeList extends React.Component<Props, {}> {
    render =  () => 
    {
        
        const cn = classnames("status-badge-list", this.props.className)
        return ( <div className={cn}>
                    {this.props.setting.map(i => {
                        const icon = statusBadgeIcons[i]
                        return <i key={i} className={icon}></i>
                    })}
                </div>
        )
    }
}
