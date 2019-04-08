import * as React from 'react'
import { Community, Group, Project, Event, Task, UserProfile, IntraSocialType, Linkable } from "../../types/intrasocial_types";
import { Link } from "react-router-dom";
import { translate } from '../../localization/AutoIntlProvider';
import { userFullName, nullOrUndefined } from '../../utilities/Utilities';
import classnames = require('classnames');
import { Settings } from '../../utilities/Settings';

type Props = {
    to:Linkable
    type?:IntraSocialType
} & React.HTMLAttributes<HTMLElement>
export const IntraSocialLink = (props:Props) => {

    const {to, type, title, children, className,  ...rest} = props
    const renderTitle = Settings.renderLinkTitle
    let newTitle = renderTitle ? title : undefined
    if(renderTitle && !newTitle && !nullOrUndefined( type ))
    {
        switch(type)
        {
            case IntraSocialType.community:
            {
                const obj = to as Community
                newTitle = `${translate("common.community")} ${obj.name}`
                break;
            }
            case IntraSocialType.group:
            {
                const obj = to as Group
                newTitle = `${translate("common.group")} ${obj.name}`
                break;
            }
            case IntraSocialType.project:
            {
                const obj = to as Project
                newTitle = `${translate("common.project")} ${obj.name}`
                break;
            }
            case IntraSocialType.event:
            {
                const obj = to as Event
                newTitle = `${translate("common.event")} ${obj.name}`
                break;
            }
            case IntraSocialType.profile:
            {
                const obj = to as UserProfile
                newTitle = `${translate("common.profile")} ${userFullName(obj)}`
                break;
            }
            case IntraSocialType.task:
            {
                const obj = to as Task
                newTitle = `${translate("common.task")} ${obj.title}`
                break;
            }
            default:{
            }
        }
    }
    if(renderTitle && !newTitle)
        console.warn("IntraSocialLink:", "Title is missing for object", to)
    if(!to.uri)
    {
        console.warn("IntraSocialLink:", "URL is missing for object", to)
        return <span className="text-danger" title={newTitle}>{"["}{props.children}{"]"}</span>
    }
    const cn = classnames("text link", className)
    return <Link {...rest} className={cn} to={to.uri} title={newTitle}>{children}</Link>
    
}