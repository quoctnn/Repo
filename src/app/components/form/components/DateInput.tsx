import * as React from 'react';
import { InputGroup } from 'reactstrap';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import classnames from 'classnames';
import {FormComponentBaseProps } from '../definitions';
import { DateTimePicker } from '../../general/input/DateTimePicker';
import { Moment } from "moment";
import * as moment from "moment-timezone";
import "./DateRangeInput.scss"

export type DateInputProps = {
    value:string
    id:string
    title:string
    placeholder?:string
    allowHoursPicker?:boolean
    min?:Moment
} & FormComponentBaseProps
export type DateInputState = {
    value?:string
    valueSet?:boolean
}
export class DateInput extends React.Component<DateInputProps, DateInputState> implements FormComponentBase{

    serializedDateFormat = this.props.allowHoursPicker ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"
    constructor(props:DateInputProps){
        super(props)
        this.state = {
            value:props.value || null,
            valueSet:false
        }
    }
    getValue = () => {
        const {value} = this.state
        if(this.state.value == this.props.value)
            return null
        return {value}
    }
    isValid = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        return performValidation ? !!this.state.value : true
    }
    getErrors = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(!performValidation)
            return null
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if(Object.keys(e).length > 0)
            return e
        if(!this.state.value)
            e[this.props.id] = translate("input.error.length.required")
        return e
    }
    sendValueChanged = (value:boolean) => () => {
        if(value)
            this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.getValue().value, this.props.isRequired)
    }
    onTimeChanged = (value: Moment, name: string) => {
        const str = value && value.format(this.serializedDateFormat)
        this.setState((prevState:DateInputState) => {
            return {value:str}
        }, this.sendValueChanged(true))
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const hours = this.props.allowHoursPicker == null ? true : this.props.allowHoursPicker
        const cn = classnames({"d-block":hasError})
        let value = this.state.value && moment(this.state.value)
        return <div key={this.props.id} className="form-date-range-input">
                <InputGroup className="form-group form-input d-block">
                    <label className="col-form-label">
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    <DateTimePicker
                        min={this.props.min}
                        onChange={this.onTimeChanged}
                        value={value}
                        format={this.serializedDateFormat}
                        allowHoursPicker={hours}
                        placeholder={this.props.placeholder}
                    />
                </InputGroup>

            </div>
    }
}