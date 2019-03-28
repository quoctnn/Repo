import * as React from 'react';
import classnames from "classnames"
import Select from 'react-select';
import { translate } from '../../localization/AutoIntlProvider';
import { ProfileFilterOption } from './ProjectProfileFilter';


type Props = {
    value:ProfileFilterOption
    options:ProfileFilterOption[]
    onValueChange:(value:ProfileFilterOption) => void
}
type State = {
    selectedValue:ProfileFilterOption
}
export class ProfileFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    constructor(props:Props)
    {
        super(props)
        this.state = { selectedValue:props.value}
    }
    onChange = (value:ProfileFilterOption) => {
        this.setState({ selectedValue: value }, () => this.props.onValueChange(this.state.selectedValue));
    }
    render() 
    {
        const {className} = this.props
        const { selectedValue} = this.state;
        const cn = classnames("context-filter", className)
        return(<div className={cn}>
                <Select 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        isMulti={false}
                        name="profiles"
                        value={selectedValue}
                        menuPortalTarget={document.body} 
                        onChange={this.onChange}
                        placeholder={translate("project.filter.profile.placeholder")}
                        closeMenuOnSelect={false}
                        options={this.props.options} />
                </div>
        );
    }
}