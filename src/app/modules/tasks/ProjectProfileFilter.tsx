import * as React from 'react';
import classnames from "classnames"
import { ProjectManager } from '../../managers/ProjectManager';
import { ProfileManager } from '../../managers/ProfileManager';
import { AsyncSelectIW } from '../../components/general/input/AsyncSelectIW';
import { ProfileSelectorOption, ProfileOptionComponent, ProfileSingleValueComponent } from '../../components/general/input/SelectExtensions';


type Props = {
    value:ProfileSelectorOption
    project:number
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
            if(!profiles)
            {
                completion(ProfileManager.searchProfiles(text,null, 50, true).map(ProfileSelectorOption.fromUserProfile))
            } else {
                ProfileManager.ensureProfilesExists(profiles, () => {
                    completion(ProfileManager.searchProfileIds(text, profiles).map(ProfileSelectorOption.fromUserProfile))
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