import * as React from 'react'
import { Community, Group, Project, Event, Task, UserProfile, Linkable, ContextNaturalKey } from "../../types/intrasocial_types";
import { Link } from "react-router-dom";
import { translate } from '../../localization/AutoIntlProvider';
import { userFullName, nullOrUndefined } from '../../utilities/Utilities';
import classnames = require('classnames');
import { Settings } from '../../utilities/Settings';
import { ContextManager } from '../../managers/ContextManager';

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
        newTitle = `${translate("common." + type)} ${name || ContextNaturalKey.nameForContextObject(type, to as any)}`
    }
    if(renderTitle && !newTitle)
        console.warn("IntraSocialLink:", "Title is missing for object", to)
    if(!to || !to.uri)
    {
        console.warn("IntraSocialLink:", "URL is missing for object", to)
        return <span className="text-danger" title={newTitle}>{"["}{props.children}{"]"}</span>
    }
    const cn = classnames("text link", className)
    return <Link {...rest} className={cn} to={to.uri} title={newTitle}>{children}</Link>
    
}