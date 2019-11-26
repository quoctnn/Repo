import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup, Input } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { nullOrUndefined } from '../../../utilities/Utilities';

export type TextInputProps = {
    value: string
    placeholder?: string
} & FormComponentBaseProps
export type TextInputState = {
    value?: string
    valueSet?: boolean
}
export class TextInput extends React.Component<TextInputProps, TextInputState> implements FormComponentBase {
    constructor(props: TextInputProps) {
        super(props)
        this.state = {
            value: nullOrUndefined(this.props.value) ? "" : this.props.value.toString()
        }
    }
    getValue = () => {
        if (this.state.value == this.props.value)
            return null
        return this.state.value
    }
    clear = () => {
        this.setState({value: undefined})
    }
    isValid = () => {
        const performValidation = this.props.hasSubmitted || this.state.valueSet
        return performValidation && this.props.isRequired ? this.state.value.trim().length > 0 : true
    }
    getErrors = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet)
        if (!performValidation)
            return null
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if (Object.keys(e).length > 0)
            return e
        if (!this.isValid()) {
            e[this.props.id] = translate("input.error.length.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.props.value == this.state.value ? null : this.state.value
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return { value, valueSet: true }
        }, this.sendValueChanged)
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys(errors).length > 0
        const cn = classnames({ "d-block": hasError })
        return <div key={this.props.id} className="form-text-input">
            <InputGroup className="form-group form-input d-block">
                {this.props.title &&
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                }
                <div className="">
                    <Input invalid={hasError} id={this.props.id} value={this.state.value} type="text" onChange={this.handleInputChange} placeholder={this.props.placeholder} />
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                </div>
            </InputGroup>
        </div>
    }
}