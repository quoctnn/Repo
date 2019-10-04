
import * as React from "react";
import classnames from 'classnames';
import ColorMarkComponent from "./ColorMarkComponent";
import { Badge } from "reactstrap";
import "./RoleBadgeComponent.scss"

type Props = {
    color:string
    className?:string
    title:string
}
const RoleBadgeComponent = (props:Props) => (
    <Badge className={classnames("text-truncate role-badge d-flex align-items-center", props.className)} pill={true}><ColorMarkComponent color={props.color} className="mr-1"/><span>{props.title}</span></Badge>
)
export default  RoleBadgeComponent