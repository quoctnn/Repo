import * as React from 'react'
import { Community, Group, Project, Event, Task, UserProfile, Linkable, ContextNaturalKey } from "../../types/intrasocial_types";
import { Link } from "react-router-dom";
import { translate } from '../../localization/AutoIntlProvider';
import { userFullName, nullOrUndefined } from '../../utilities/Utilities';
import classnames = require('classnames');
import { Settings } from '../../utilities/Settings';

type Props = {
    to:Linkable
    type?:ContextNaturalKey
    name?:string
} & React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ClassAttributes<Link>

export const IntraSocialLink = (props:Props) => {

    const {to, type, title, children, className, name,  ...rest} = props
    const renderTitle = Settings.renderLinkTitle
    let newTitle = renderTitle ? title : undefined
    if(renderTitle && !newTitle && !nullOrUndefined( type ))
    {
        switch(type)
        {
            case ContextNaturalKey.COMMUNITY:
            {
                const obj = to as Community
                newTitle = `${translate("common.community")} ${name || obj.name}`
                break;
            }
            case ContextNaturalKey.GROUP:
            {
                const obj = to as Group
                newTitle = `${translate("common.group")} ${name || obj.name}`
                break;
            }
            case ContextNaturalKey.PROJECT:
            {
                const obj = to as Project
                newTitle = `${translate("common.project")} ${name || obj.name}`
                break;
            }
            case ContextNaturalKey.EVENT:
            {
                const obj = to as Event
                newTitle = `${translate("common.event")} ${name || obj.name}`
                break;
            }
            case ContextNaturalKey.USER:
            {
                const obj = to as UserProfile
                newTitle = `${translate("common.profile")} ${name || userFullName(obj)}`
                break;
            }
            case ContextNaturalKey.TASK:
            {
                const obj = to as Task
                newTitle = `${translate("common.task")} ${name || obj.title}`
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