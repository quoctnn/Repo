import * as React from 'react';
import { FormComponentBase } from '../FormController';
import { FormComponentBaseProps } from '../definitions';
import * as moment from 'moment-timezone';
import { SelectInput, InputOptionGroup } from './SelectInput';
import { countries, zones } from 'moment-timezone/data/meta/latest.json';
import { InputOption } from './RichRadioGroupInput';

export type TimezoneInputProps = {
    value:string
    placeholder?:string
} & FormComponentBaseProps
export type TimezoneInputState = {
    options: InputOptionGroup[]
}
export class TimezoneInput extends React.Component<TimezoneInputProps, TimezoneInputState> implements FormComponentBase{
    selectRef = React.createRef<SelectInput>()
    constructor(props:TimezoneInputProps){
        super(props)
        const keys = Object.keys(countries)
        const options = keys.map(k => {
            const c = countries[k]
            const opts:InputOption[] = c.zones.map(z => {return {label:z, value:z}})
            const group:InputOptionGroup =  {label:c.name, options:opts}
            return group
        })
        this.state = {
            options
        }
    }
    getValue = () => {
        return this.selectRef && this.selectRef.current && this.selectRef.current.getValue()
    }
    isValid = () => {
        return this.selectRef && this.selectRef.current && this.selectRef.current.isValid() || false
    }
    render = () => {
        return <SelectInput options={this.state.options}
                        errors={this.props.errors} 
                        hasSubmitted={this.props.hasSubmitted}
                        ref={this.selectRef} 
                        onValueChanged={this.props.onValueChanged} 
                        value={this.props.value} 
                        title={this.props.title} 
                        id={this.props.id}
                        isRequired={this.props.isRequired} />
    }
}