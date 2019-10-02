

import * as React from 'react';
import { UserProfile } from '../../../types/intrasocial_types';
import { userFullName, userAvatar } from '../../../utilities/Utilities';
import { MultiValueProps } from 'react-select/src/components/MultiValue';
import { components } from 'react-select';
import Avatar from '../Avatar';
import { OptionProps } from 'react-select/src/components/Option';
import { SingleValueProps } from 'react-select/src/components/SingleValue';
import "./SelectExtensions.scss"
export type ProfileSelectorOption = { value: string, label: string, id:number, icon?:string}
export namespace ProfileSelectorOption{

    export const fromUserProfile = (profile:UserProfile):ProfileSelectorOption => {
        return {value:profile.id.toString(), id:profile.id, label:userFullName(profile), icon:userAvatar(profile, true)}
    }
}
export const ProfileMultiValueLabel = (props:MultiValueProps<ProfileSelectorOption>) => {
    const {children, ...rest} = props
    const size = 20
    return (
        <div className="profile-multi-value-label"><components.MultiValueLabel {...rest}>
            {props.data.icon && <Avatar className="mr-1" size={size} image={props.data.icon} />}
            <div className="content">{children}</div>
        </components.MultiValueLabel></div>
    );
  }
export const ProfileOptionComponent = (props:OptionProps<ProfileSelectorOption>) => {

    const option = props.data as ProfileSelectorOption
    const onClick = props.innerProps.onClick
    const onMouseOver = props.innerProps.onMouseOver
    const avatar = option.icon
    const {cx, getStyles, className, isDisabled, isFocused, isSelected } = props
    return (<div style={getStyles('option', props)}
        className={className}
        onClick={onClick}
        title={option.label}
        onMouseOver={onMouseOver}
        >
        <div className="Select-value-label d-flex">
            {avatar && <Avatar size={24} image={avatar} style={{paddingRight:"8px", display:"inline"}}/>}
            {props.children}
        </div>
    </div>)
}
export const ProfileSingleValueComponent = (props:SingleValueProps<ProfileSelectorOption>) => {

    const option = props.data
    const avatar = option.icon
    const {getStyles, className} = props
    const styles:React.CSSProperties = {...getStyles('option', props), position:"absolute", paddingLeft:4}
    return (<span style={styles}
            className={className}
            title={option.label}
            >
            <div className="Select-value-label d-flex text-truncate">
                {avatar && <Avatar size={24} image={avatar} style={{paddingRight:"8px", display:"inline"}}/>}
                <div className="text-truncate">{props.children}</div>
            </div>
        </span>)
}