import * as React from "react";
import "./StatusBadgeList.scss"
import classnames from 'classnames';
import { ObjectAttributeType } from "../../types/intrasocial_types";
export enum ObjectAttributeTypeExtension {
    read = "read"
}
export namespace ObjectAttributeTypeExtension {
    export function iconForType(type: ObjectAttributeTypeExtension) {
        switch(type){
            case ObjectAttributeTypeExtension.read: return "far fa-eye"
            default:return "fas fa-question"
        }
    }
}
interface OwnProps 
{
    className?:string
    setting:(ObjectAttributeType | ObjectAttributeTypeExtension)[]
}
type Props = OwnProps
export class StatusBadgeList extends React.Component<Props, {}> {
    icon = (item:ObjectAttributeType | ObjectAttributeTypeExtension) => {
        if(item in ObjectAttributeTypeExtension)
            return ObjectAttributeTypeExtension.iconForType(item as ObjectAttributeTypeExtension)
        return ObjectAttributeType.iconForType(item as ObjectAttributeType)
    }
    render =  () => 
    {
        
        const cn = classnames("status-badge-list", this.props.className)
        return ( <div className={cn}>
                    {this.props.setting.map(i => {
                        const icon = this.icon(i)
                        return <i key={i} className={icon}></i>
                    })}
                </div>
        )
    }
}
