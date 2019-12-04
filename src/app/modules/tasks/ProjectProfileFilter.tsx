import * as React from 'react';
import classnames from "classnames"
import { AsyncSelectIW } from '../../components/general/input/AsyncSelectIW';
import { ProfileSelectorOption, ProfileOptionComponent, ProfileSingleValueComponent } from '../../components/general/input/SelectExtensions';
import { ProfileManager } from '../../managers/ProfileManager';


type Props = {
    value:ProfileSelectorOption
    projectMembers:number[]
    onValueChange:(value:ProfileSelectorOption) => void
}
type State = {
}
export class ProjectProfileFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    constructor(props:Props)
    {
        super(props)
    }
    onChange = (value:ProfileSelectorOption) => {
        this.props.onValueChange(value)
    }
    getProfiles = (text:string, completion:(options:ProfileSelectorOption[]) => void) => {
        const resp = (profiles:number[]) => {
            if(profiles && profiles.length > 0)
            {
                ProfileManager.ensureProfilesExists(profiles, () => {
                    completion(ProfileManager.searchProfileIds(text, profiles).map(ProfileSelectorOption.fromUserProfile))
                })
            } else {
                completion(ProfileManager.searchProfiles(text,null, 50, true).map(ProfileSelectorOption.fromUserProfile))
            }
        }
        resp(this.props.projectMembers)
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
                <AsyncSelectIW
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