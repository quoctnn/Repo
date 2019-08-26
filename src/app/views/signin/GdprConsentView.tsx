import * as React from 'react'
import "./GdprForm.scss"
import {GDPRProcessingActivityConsent, GDPRProcessingActivityConsentChoice, GDPRProcessingActivityType, GDPRFormConsents} from '../../types/intrasocial_types';
import { FormGroup, Label, Input } from 'reactstrap';
import { InputType } from 'reactstrap/lib/Input';
type Props = {
    consent:GDPRProcessingActivityConsent
    onConsentChange:() => void
}
type State = {
    selectedChoices:string[]
}
export default class GdprConsentView extends React.Component<Props, State> {

    constructor(props:Props) {
        super(props);
        this.state = {
            selectedChoices:[]
        }
    }
    handleInputChange = (choice:GDPRProcessingActivityConsentChoice) => (event:React.ChangeEvent<HTMLInputElement>) => {
        const selectedChoices = [...this.state.selectedChoices]
        const ix = selectedChoices.indexOf(choice.id)
        if(ix > -1)
        {
            selectedChoices.splice(ix, 1)
        }
        else {
            selectedChoices.push(choice.id)
        }
        this.setState(() => {
            return {selectedChoices}
        }, this.props.onConsentChange)
    }
    getConsent = () => {
        let consentForm:GDPRFormConsents = {
            agreedChoiceIds : this.state.selectedChoices,
            id : this.props.consent.id
        }
        return consentForm
    }
    canContinue = () => {
        return this.props.consent.mandatory ? this.state.selectedChoices.length >= 1 : true
    }
    renderConsentChoice = (inputType:InputType, choice:GDPRProcessingActivityConsentChoice, name:string) => {
        //keep track of selection
        //check if confirm button is active
        const checked = this.state.selectedChoices.indexOf(choice.id) > -1
        return <div key={"choice" + choice.id} className="consent-choice">
            <FormGroup check={true}>
                <Label check={true}>
                    <Input name={name} type={inputType} onChange={this.handleInputChange(choice)} checked={checked} />{choice.message}
                </Label>
            </FormGroup>
        </div>
    }
    setConsent = () => {

    }
    renderConsent = (consent:GDPRProcessingActivityConsent) => {
        const name = "consent_" + consent.id
        return <div className="consent">
            <div className="title">{consent.title}</div>
            <div className="explanation">{consent.explanation}</div>
            <div className="question">{consent.mandatory ? "* " + consent.question : consent.question}</div>
            <div className="choices">
                {consent.choices.map(c => {
                    this.renderConsentChoice(consent.type == GDPRProcessingActivityType.multipleChoice ? "checkbox" : "radio", c, name)
                })}
            </div>
        </div>
    }
    render = () => {
        const consent = this.props.consent
        return this.renderConsent(consent)
    }
}