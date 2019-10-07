import * as React from 'react';
import classnames from "classnames"
import Select from 'react-select';
import { UserProfile } from '../../../types/intrasocial_types';
import { ProfileSelectorOption, ProfileOptionComponent, ProfileSingleValueComponent, ProfileMultiValueLabel } from '../input/SelectExtensions';


type Props = {
    allowedProfiles:UserProfile[]
    selectedProfiles:UserProfile[]
    onValueChange:(selectedProfiles:UserProfile[]) => void
    placeholder?:string
}
type State = {
    selectedOptions:ProfileSelectorOption[]
    allowedOptions:ProfileSelectorOption[]
}
export class ProfileSelector extends React.PureComponent<Props, State> {
    constructor(props:Props)
    {
        super(props)
        this.state = { 

            selectedOptions:props.selectedProfiles.map(ProfileSelectorOption.fromUserProfile),
            allowedOptions:props.allowedProfiles.map(ProfileSelectorOption.fromUserProfile)
        }
    }
    optionToProfile = (opt:ProfileSelectorOption) => {
        return this.props.allowedProfiles.find(p => p.id == opt.id)
    }
    onChange = (values:ProfileSelectorOption[]) => {
        const vals = values || []
        this.setState(() => {
            return { selectedOptions: vals }
        }, () => this.props.onValueChange(this.state.selectedOptions.map(this.optionToProfile).filter(p => !!p)))
    }
    render() 
    {
        const { selectedOptions, allowedOptions: allowedValues} = this.state;
        const cn = classnames("profile-selector")
        return(<div className={cn}>
                <Select 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        isMulti={true}
                        name="profiles"
                        value={selectedOptions}
                        menuPortalTarget={document.body} 
                        onChange={this.onChange}
                        placeholder={this.props.placeholder}
                        isClearable={false}
                        closeMenuOnSelect={false}
                        classNamePrefix="select"
                        autoFocus={true}
                        components={{ Option: ProfileOptionComponent, SingleValue:ProfileSingleValueComponent, MultiValueLabel:ProfileMultiValueLabel }}
                        options={allowedValues} />
                </div>
        );
    }
}