import * as React from 'react';
import classNames from 'classnames';
import { Settings } from '../../utilities/Settings';

export interface Props 
{
    onPress?:(event:any) => void
    children?:React.ReactNode
    disabled?:boolean
    className?:string
    href?:string
    title?:string
}
export const Text = (props:Props) => {

    const {className, href} = props
    const cn = classNames("text", className, {link:!!props.onPress || !!href})
    const title = Settings.renderLinkTitle ? props.title : undefined
    if(!!href)
    {
        if(Settings.renderLinkTitle && !title)
            console.warn("Text:", "Title is missing for url ", href)
        return <a href={href} title={title}>{props.children}</a>
    }
    return (
        <span className={cn} onClick={props.onPress} title={title}>
            {props.children}
        </span>
    );
}