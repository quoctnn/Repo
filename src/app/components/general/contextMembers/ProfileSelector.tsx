import * as React from 'react';
import classnames from "classnames"
import Select from 'react-select';
import { UserProfile } from '../../../types/intrasocial_types';
import { ProfileSelectorOption, ProfileOptionComponent, ProfileSingleValueComponent, ProfileMultiValueLabel } from '../input/SelectExtensions';


type Props = {
    autoFocus?:boolean
    allowedProfiles:UserProfile[]
    selectedProfiles:UserProfile[]
    multiSelect?:boolean
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
    onMultiChange = (values:ProfileSelectorOption[]) => {
        const vals = values || []
        this.setState(() => {
            return { selectedOptions: vals }
        }, () => this.props.onValueChange(this.state.selectedOptions.map(this.optionToProfile).filter(p => !!p)))
    }
    onSingleChange = (value:ProfileSelectorOption) => {
        const vals = [value]
        this.setState(() => {
            return { selectedOptions: vals }
        }, () => this.props.onValueChange(this.state.selectedOptions.map(this.optionToProfile).filter(p => !!p)))
    }
    render()
    {
        const { selectedOptions, allowedOptions: allowedValues} = this.state;
        const autoFocus = this.props.autoFocus == null ? true : this.props.autoFocus
        const cn = classnames("profile-selector select-input-field")
        return(<div className={cn}>
                <Select
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999, }),
                                  option: base => ({ ...base, color: "#2d2d2d"}) }}
                        isMulti={this.props.multiSelect}
                        menuColor="red"
                        name="profiles"
                        value={selectedOptions}
                        menuPortalTarget={document.body}
                        onChange={this.props.multiSelect ? this.onMultiChange : this.onSingleChange}
                        placeholder={this.props.placeholder}
                        isClearable={false}
                        closeMenuOnSelect={!this.props.multiSelect}
                        classNamePrefix="select"
                        autoFocus={autoFocus}
                        components={{ Option: ProfileOptionComponent, SingleValue:ProfileSingleValueComponent, MultiValueLabel:ProfileMultiValueLabel }}
                        options={allowedValues} />
                </div>
        );
    }
}