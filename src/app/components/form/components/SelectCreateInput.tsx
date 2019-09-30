import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { InputOption } from './RichRadioGroupInput';
import { SelectComponents } from 'react-select/src/components';

export type SelectCreateInputProps = {
    placeholder?:string
    canCreateValue:(value:string) => boolean
    description?:string
} & FormComponentBaseProps
export type SelectCreateInputState = {
    value:InputOption[]
    inputValue:string
    valueSet?:boolean
}
const components:Partial<SelectComponents<InputOption>> = {
    DropdownIndicator: null,
}
export class SelectCreateInput extends React.Component<SelectCreateInputProps, SelectCreateInputState> implements FormComponentBase{
    constructor(props:SelectCreateInputProps){
        super(props)
        this.state = {
            value:[],
            inputValue:""
        }
    }
    getValue = () => {
        if(this.state.value.length == 0)
            return null
        return this.state.value.map(v => v.value)
    }
    isValid = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(performValidation)
        {
            return this.state.value.length > 0
        }
        return true
    }
    getErrors = () => {
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if(Object.keys(e).length > 0)
            return e
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(!performValidation)
                return null
        if(!this.isValid())
        {
            e[this.props.id] = translate("input.error.select.option.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.getValue()
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleChange = (newValue: InputOption[], actionMeta: any) => {
        this.setState(() => {
            return { value: newValue || [] }
        },this.sendValueChanged)
    }
    handleInputChange = (inputValue: string) => {
        this.setState(() => {
            return { inputValue }
        })
    }
    handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        const { inputValue, value } = this.state
        if (!inputValue) 
            return
        switch (event.key) {
          case 'Enter':
          case 'Tab':
            {
                event.preventDefault()
                if(this.props.canCreateValue(inputValue))
                {
                    const newOption:InputOption = {label:inputValue, value:inputValue}
                    this.setState((prevState:SelectCreateInputState) => {
                        return {inputValue:"", value:[...value, newOption]}
                    }, this.sendValueChanged)
                }
            }
        }
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        return <div key={this.props.id} className="form-select-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    <div className="">
                    <CreatableSelect
                    components={components}
                        inputValue={this.state.inputValue}
                        isClearable={true}
                        isMulti={true}
                        menuIsOpen={false}
                        onChange={this.handleChange}
                        onInputChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.value}
                        placeholder={this.props.placeholder}
                    />
                        {this.props.description && <div className="description" dangerouslySetInnerHTML={{__html:this.props.description}}></div>}
                    </div>
                </InputGroup>
            </div>
    }
}