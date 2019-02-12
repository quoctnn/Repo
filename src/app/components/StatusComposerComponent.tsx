import * as React from "react";
import "./StatusComposerComponent.scss"
import { StatusActions } from "../types/intrasocial_types";
import classnames from 'classnames';

interface OwnProps 
{
    onActionPress:(action:StatusActions, extra?:Object) => void
    canMention:boolean
    canComment:boolean
    canUpload:boolean
    className?:string
    statusId:number
    contextObjectId:number 
    contextNaturalKey:string
    communityId:number
}
type Props = OwnProps
export class StatusComposerComponent extends React.Component<Props, {}> {
    render() {
        const cn = classnames("status-composer", this.props.className)
        return(
            <div className={cn}>
                StatusComposer
            </div>
        );
    }
}
