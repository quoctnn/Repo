import * as React from 'react';
import classnames from "classnames"
import { UserProfile } from '../../types/intrasocial_types';
import { userFullName, userAvatar } from '../../utilities/Utilities';
import { ProjectManager } from '../../managers/ProjectManager';
import { ProfileManager } from '../../managers/ProfileManager';
import Avatar from '../../components/general/Avatar';
import { AsyncSelectIW } from '../../components/general/input/AsyncSelectIW';
import { SingleValueProps } from 'react-select/src/components/SingleValue';
import { OptionProps } from 'react-select/src/components/Option';

export type ProfileFilterOption = { value: string, label: string, id:number, icon:string}
export const createProfileFilterOption = (profile:UserProfile):ProfileFilterOption => {
    return {value:profile.slug_name, label:userFullName(profile), id:profile.id, icon:userAvatar(profile, true)}
}
export const ProfileOptionComponent = (props:OptionProps<ProfileFilterOption>) => {

    const option = props.data as ProfileFilterOption
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
export const ProfileSingleValueComponent = (props:SingleValueProps<ProfileFilterOption>) => {

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

type Props = {
    value:ProfileFilterOption
    project:number
    onValueChange:(value:ProfileFilterOption) => void
}
type State = {
}
export class ProjectProfileFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    constructor(props:Props)
    {
        super(props)
    }
    onChange = (value:ProfileFilterOption) => {
        this.props.onValueChange(value)
    }
    getProfiles = (text:string, completion:(options:ProfileFilterOption[]) => void) => {
        const resp = (profiles:number[]) => {
            if(!profiles)
            {
                completion(ProfileManager.searchProfiles(text,null, 50, true).map(createProfileFilterOption))
            } else {
                ProfileManager.ensureProfilesExists(profiles, () => {
                    completion(ProfileManager.searchProfileIds(text, profiles).map(createProfileFilterOption))
                })
            }
        }
        if(this.props.project)
        {
            ProjectManager.ensureProjectExists(this.props.project, (project) => {
                resp(project.members || [])
            })
        }
        else {
            resp(null)
        }
    }
    searchOptions = (text:string) => {
        return new Promise((resolve) => {
            return this.getProfiles(text, (profiles) => {
                resolve(profiles)
                if(this.props.value && profiles && !profiles.find(p => p.id == this.props.value.id))
                    this.props.onValueChange(null)
            })
        })
    }
    render()
    {
        const {className} = this.props
        const { value} = this.props;
        const cn = classnames("context-filter", className)
        return(<div className={cn}>
                <AsyncSelectIW key={"project_" + this.props.project}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    isClearable={true}
                    value={value}
                    menuPortalTarget={document.body}
                    cacheOptions={false}
                    defaultOptions={true}
                    onChange={this.onChange}
                    components={{ Option: ProfileOptionComponent, SingleValue:ProfileSingleValueComponent }}
                    loadOptions={this.searchOptions} />
                </div>
        );
    }
}