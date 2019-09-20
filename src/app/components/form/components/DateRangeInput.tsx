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

export type DateRangeInputProps = {
    start:string
    end:string
    startId:string
    endId:string
    startTitle:string
    endTitle:string
    startPlaceholder?:string
    endPlaceholder?:string
} & FormComponentBaseProps
export type DateRangeInputState = {
    start?:string
    end?:string
    valueSet?:boolean
}
export class DateRangeInput extends React.Component<DateRangeInputProps, DateRangeInputState> implements FormComponentBase{
    
    serializedDateFormat = "YYYY-MM-DD HH:mm"
    constructor(props:DateRangeInputProps){
        super(props)
        this.state = {
            start:props.start || null,
            end:props.end || null,
            valueSet:false
        }
    }
    getValue = () => {
        const {start, end} = this.state
        if(this.state.start == this.props.start && this.state.end == this.props.end)
            return null
        return {start, end}
    }
    isValid = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        return performValidation ? !!this.state.start && !!this.state.end: true
    }
    getErrors = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(!performValidation)
            return null
        let e = this.props.errors && this.props.errors([this.props.startId, this.props.endId]) || {}
        if(Object.keys(e).length > 0)
            return e
        if(!this.state.start)
            e[this.props.startId] = translate("input.error.length.required")
        if(!this.state.end)
            e[this.props.endId] = translate("input.error.length.required")
        return e
    }
    sendValueChanged = (startValue:boolean) => () => {
        if(startValue)
            this.props.onValueChanged && this.props.onValueChanged(this.props.startId, this.getValue().start, this.props.isRequired)
        else 
            this.props.onValueChanged && this.props.onValueChanged(this.props.endId, this.getValue().end, this.props.isRequired)
    }
    onFromTimeChanged = (value: Moment, name: string) => {
        const str = value && value.format(this.serializedDateFormat)
        this.setState((prevState:DateRangeInputState) => {
            return {start:str}
        }, this.sendValueChanged(true))
    }
    onToTimeChanged = (value: Moment, name: string) => {
        const str = value && value.format(this.serializedDateFormat)
        this.setState((prevState:DateRangeInputState) => {
            return {end:str}
        }, this.sendValueChanged(false))
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        let start = this.state.start && moment(this.state.start)
        let end = this.state.end && moment(this.state.end)
        return <div key={this.props.id} className="form-date-range-input">
                <InputGroup className="form-group form-input d-block">
                    <label className="col-form-label">
                        {this.props.startTitle}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.startId} />
                    <DateTimePicker
                        onChange={this.onFromTimeChanged}
                        value={start}
                        max={end}
                        format={this.serializedDateFormat}
                        allowHoursPicker={true}
                        placeholder={this.props.startPlaceholder}
                    />
                    <label className="col-form-label">
                        {this.props.endTitle}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.endId} />
                    <DateTimePicker
                        onChange={this.onToTimeChanged}
                        value={end}
                        min={start}
                        format={this.serializedDateFormat}
                        allowHoursPicker={true}
                        placeholder={this.props.endPlaceholder}
                    />
                </InputGroup>
                
            </div>
    }
}