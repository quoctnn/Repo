import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { InputOption } from './RichRadioGroupInput';
import { SelectComponents } from 'react-select/src/components';
import { combineReducers } from 'redux';

export type SelectCreateInputProps = {
    placeholder?: string
    canCreateValue: (value: string) => boolean
    description?: string
    values?: InputOption[]
    value?: InputOption
    selectableValues?: InputOption[]
    multiSelect?: boolean
} & FormComponentBaseProps
export type SelectCreateInputState = {
    value: InputOption[]
    inputValue: string
    valueSet?: boolean
    menuOpen: boolean
    selectableValues: InputOption[]
}
const components: Partial<SelectComponents<InputOption>> = {
    DropdownIndicator: null,
}
export class SelectCreateInput extends React.Component<SelectCreateInputProps, SelectCreateInputState> implements FormComponentBase {
    constructor(props: SelectCreateInputProps) {
        super(props)
        this.state = {
            value: this.props.values || this.props.value ? [this.props.value] : [],
            inputValue: "",
            menuOpen: false,
            selectableValues: this.props.selectableValues || []
        }
    }
    getValue = () => {
        if (this.props.multiSelect)
            if (this.state.value.length == 0)
                return null
        return this.state.value.map(v => v.value)
    }
    isValid = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if (performValidation) {
            return this.state.value.length > 0
        }
        return true
    }
    getErrors = () => {
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if (Object.keys(e).length > 0)
            return e
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if (!performValidation)
            return null
        if (!this.isValid()) {
            e[this.props.id] = translate("input.error.select.option.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.getValue()
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleFocus = (e: React.SyntheticEvent<any>) => {
        if (!this.props.multiSelect && this.state.value.length > 0) {
            this.setState(() => { return { menuOpen: true, inputValue: this.state.value[0].value } })
        } else {
            this.setState(() => { return { menuOpen: true } })
        }
    }
    handleMultiChange = (newValue: InputOption[], actionMeta: any) => {
        this.setState(() => {
            return { value: newValue || [] }
        }, this.sendValueChanged)
    }
    handleChange = (newValue: InputOption, actionMeta: any) => {
        switch (actionMeta && actionMeta.action) {
            case "select-option":
                this.setState(() => { return { value: [newValue] } }, this.sendValueChanged);
                break;
            case "clear":
                this.setState(() => { return { inputValue: "", value: [] } }, this.sendValueChanged);
            default:
                break;
        }
    }
    handleInputChange = (inputValue: string, actionMeta: any) => {
        switch (actionMeta && actionMeta.action) {
            case "menu-close":
                this.setState(() => { return { menuOpen: false } })
                break;
            case "input-change":
                this.setState(() => { return { inputValue, menuOpen: true } })
                break;
            case "input-blur":
                this.setState(() => { return { inputValue } })
                break;
            default:
                break;
        }
    }
    handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        const { inputValue, value, selectableValues } = this.state
        if (!inputValue)
            return
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                {
                    event.preventDefault()
                    if (this.props.canCreateValue(inputValue)) {
                        const newOption: InputOption = { label: inputValue, value: inputValue }
                        if (this.props.multiSelect) {
                            this.setState((prevState: SelectCreateInputState) => {
                                return { inputValue: "", value: [...value, newOption] }
                            }, this.sendValueChanged)
                        } else {
                            this.setState((prevState: SelectCreateInputState) => {
                                return {
                                    inputValue,
                                    value: [newOption],
                                    selectableValues: [...selectableValues, newOption]
                                }
                            }, this.sendValueChanged)
                        }
                    }
                }
        }
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys(errors).length > 0
        const cn = classnames({ "d-block": hasError })
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
                        options={this.state.selectableValues || null}
                        isClearable={true}
                        isMulti={this.props.multiSelect}
                        menuIsOpen={this.state.menuOpen}
                        onChange={this.props.multiSelect ? this.handleMultiChange : this.handleChange}
                        onInputChange={this.handleInputChange}
                        onFocus={this.handleFocus}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.value}
                        placeholder={this.props.placeholder}
                    />
                    {this.props.description && <div className="description" dangerouslySetInnerHTML={{ __html: this.props.description }}></div>}
                </div>
            </InputGroup>
        </div>
    }
}