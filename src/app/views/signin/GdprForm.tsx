import * as React from 'react'
import "./GdprForm.scss"
import { GDPRInfo, GDPRProcessingActivityConsent, GDPRProcessingActivityConsentChoice, GDPRFormAnswers } from '../../types/intrasocial_types';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import GdprConsentView from './GdprConsentView';
import { InputType } from 'reactstrap/lib/Input';
type Props = {
    data:GDPRInfo
    onFormComplete:(form:GDPRFormAnswers) => void
    onCancel:() => void
}
type State = {
    termsChecked:boolean
    consents:{[key:string]:GdprConsentView}
    canSubmitForm:boolean
}
export default class GdprForm extends React.Component<Props, State> {

    constructor(props:Props) {
        super(props);
        this.state = {
            termsChecked:props.data.terms.checked,
            consents:{},
            canSubmitForm:false
        }
    }
    componentDidMount = () => {
        this.checkCanSubmit()
    }
    termsCheckedChanged = (event:React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        this.setState(() => {return {termsChecked:checked}}, this.checkCanSubmit)
    }
    renderConsentChoice = (inputType:InputType, choice:GDPRProcessingActivityConsentChoice, name:string) => {
        //keep track of selection
        //check if confirm button is active
        return <div key={"choice" + choice.id} className="consent-choice">
            <FormGroup check={true}>
                <Label check={true}>
                    <Input name={name} type={inputType} onChange={this.termsCheckedChanged} checked={this.state.termsChecked} />{choice.message}
                </Label>
            </FormGroup>
        </div>
    }
    handleConsentChange = () => {
        this.checkCanSubmit()
    }
    checkCanSubmit = () => {
        const termsOk = this.state.termsChecked
        const consentKeys = Object.keys( this.state.consents )
        const consentsOk =  consentKeys.filter(k => !this.state.consents[k].canContinue()).length == 0
        const canSubmit = termsOk && consentsOk
        if(canSubmit != this.state.canSubmitForm)
        {
            this.setState(() => {
                return {canSubmitForm:canSubmit}
            })
        }
    }
    setConsentRef = (id:string) => (ref:GdprConsentView) => {
        this.state.consents[id] = ref
    }
    renderConsent = (consent:GDPRProcessingActivityConsent) => {
        const name = "consent_" + consent.id
        return <GdprConsentView ref={this.setConsentRef(consent.id)} key={name} consent={consent} onConsentChange={this.handleConsentChange} />
    }
    renderProcessingActivity = () => {
        const activity = this.props.data.processingActivity
        if(activity)
        {
            return <div className="p-a">
                {activity.consents && activity.consents.map(c => {
                    return this.renderConsent(c)
                })}
            </div>
        }
        return null
    }
    submitForm = () => {
        const consentKeys = Object.keys( this.state.consents )
        const form:GDPRFormAnswers = {
            consentSetId:this.props.data.consentSetId,
            termId:this.props.data.terms.id,
            termsAgreed:this.state.termsChecked,
            processingActivityId:this.props.data.processingActivity && this.props.data.processingActivity.id,
            consents:consentKeys.map(k => this.state.consents[k].getConsent())
        }
        this.props.onFormComplete(form)
    }
    render = () => {
        const data = this.props.data
        if(!data)
            return null
        return <div className="gdpr-form">
            <div className="gdpr-form-title">{data.terms.title}</div>
            <p className="gdpr-form-explanation">{data.terms.explanation}</p>
            <p className="gdpr-form-question">{data.terms.questionText}</p>
            <FormGroup className="gdpr-form-terms" check={true}>
                <Label check={true}>
                    <Input type="checkbox" onChange={this.termsCheckedChanged} checked={this.state.termsChecked} />
                    <span dangerouslySetInnerHTML={{__html:data.terms.agreementText}}></span>
                </Label>
            </FormGroup>
            {this.renderProcessingActivity()}
            <div className="d-flex flex-row-reverse">
                <Button color="primary" disabled={!this.state.canSubmitForm} onClick={this.submitForm} className="confirm">{translate("Confirm")}</Button>
                <Button onClick={this.props.onCancel} className="cancel mr-1">{translate("Cancel")}</Button>
            </div>
        </div>
    }
}