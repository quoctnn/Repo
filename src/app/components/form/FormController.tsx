import * as React from 'react';
import "./FormController.scss"
import { Button, FormFeedback } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import classnames from 'classnames';
import { ContextNaturalKey, RequestErrorData } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../general/CircularLoadingSpinner';
import { TextInput, TextInputData } from './components/TextInput';
import { TextAreaInputData, TextAreaInput } from './components/TextAreaInput';
import { FormComponentData } from './definitions';
import { ContextPhotoInput, ContextPhotoInputData } from './components/ContextPhotoInput';
import { RichRadioGroupInputData, RichRadioGroupInput } from './components/RichRadioGroupInput';
import { SelectInput, SelectInputData } from './components/SelectInput';
import { ColorInputData, ColorInput } from './components/ColorInput';
import SimpleDialog from '../general/dialogs/SimpleDialog';
import { BooleanInputData, BooleanInput } from './components/BooleanInput';
import { nullOrUndefined } from '../../utilities/Utilities';
export const FormComponentErrorMessage = (props:{error?:string , className?:string}) => {
    if(!!props.error)
        return <FormFeedback className={props.className} tooltip={false}><i className="error-icon fas fa-exclamation-triangle"></i>{" "}{props.error}</FormFeedback>
    return null
}
export const FormComponentRequiredMessage = (props:{required:boolean, className?:string}) => {
    if(props.required)
        return <div className={classnames("form-field-required-text",props.className)}>{translate("form.field.required.text")}</div>
    return null
}

export enum FormStatus{
    submitting, deactivated, normal
}
export enum FormComponentType{
    text, textArea, file, richRadio
}
export type FormComponentArgument = {
    title:string
    id:string
    value?:string
    data?:any
    isRequired?:boolean
    placeholder?:string
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    error?:string
    onValueChanged?:(id:string, value?:any) => void
    onRequestNavigation?:(title?:string, toView?:React.ReactNode) => void
}
export type FormPageData = {
    title:string
    description?:string
    id:string
    componentData:FormComponentData[]
}
export interface FormComponentBase{
    isValid:() => boolean
    getValue:() => any
}
type Props = {
    pages:FormPageData[]
    title?:string
    onFormSubmit:(data:{[key:string]:string}) => void
    status:FormStatus
    didCancel:() => void
    formErrors:RequestErrorData[]
    visible:boolean
}
type State = {
    activePageIndex:number
    pageErrorData:{[key:string]:boolean}
    secondaryView:React.ReactNode
    secondaryViewTitle:string
    hasSubmitted:boolean
}
type ComponentData = FormComponentBase & React.Component<FormComponentArgument>
export default class FormController extends React.Component<Props, State> {
    pageData:{[key:string]:{[key:string]:ComponentData}} = {}
    constructor(props:Props){
        super(props)
        this.state = {
            activePageIndex:0,
            pageErrorData:{},
            secondaryView:null,
            secondaryViewTitle:null,
            hasSubmitted:false

        }
    }
    componentDidMount = () => {
        this.updateFormErrors()
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.formErrors != this.props.formErrors)
        {
            this.updateFormErrors()
        }
    }
    getFormErrorData = () => {
        const error = {}
        const pKeys = Object.keys(this.pageData)
        pKeys.forEach(pk => {
            const page = this.pageData[pk]
            const cKeys = Object.keys(page)
            const isValid = cKeys.every(ck => page[ck].isValid())
            if(!isValid)
            {
                error[pk] = true
            }
        })
        return error
    }
    updateFormErrors = (completion?:() => void) => {
        const formErrorData = this.getFormErrorData()
        this.setState(() => {
            return {pageErrorData:formErrorData}
        },completion)
    }
    handleValueChanged = (pageKey:string) =>  (id:string, value:string) => {
        const comp = this.pageData[pageKey][id]
        if(comp.props.isRequired)
        {
            console.log("handleValueChanged", id, value)
            this.updateFormErrors()
        }
    }
    navigateToMainContent = () => {
        this.setState(() => {
            return {secondaryView:null, secondaryViewTitle:null}
        })
    }
    handleRequestNavigation = (title:string, toView:React.ReactNode) => {
        this.setState(() => {
            return {secondaryView:toView, secondaryViewTitle:title}
        })
    }
    setFormRef = (pageKey:string, key:string) => (ref:any) => {
        const page = this.pageData[pageKey] || {}
        if(nullOrUndefined(ref))
        {
            delete page[key]
        }
        else {
            page[key] = ref
        }
        this.pageData[pageKey] = page
    }
    getError = (key:string):string => {
        if(this.props.formErrors)
        {
           const error = this.props.formErrors.find(fec => !!fec.getErrorMessageForField(key))
           if(error)
                return error.getErrorMessageForField(key)
        }
        return null
    }
    renderTextInput = (pageKey:string, args:TextInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <TextInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderTextAreaInput = (pageKey:string, args:TextAreaInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <TextAreaInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderContextPhotoInput = (pageKey:string, args:ContextPhotoInputData) => {
        args.error = this.getError(args.id)
        return <ContextPhotoInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderRichRadioInput = (pageKey:string, args:RichRadioGroupInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <RichRadioGroupInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderSelectInput = (pageKey:string, args:SelectInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <SelectInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderColorInput = (pageKey:string, args:ColorInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <ColorInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    } 
    renderBooleanInput = (pageKey:string, args:BooleanInputData) => {
        args.error = this.getError(args.id)
        args.hasSubmitted = this.state.hasSubmitted
        return <BooleanInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderComponent = (pageKey:string, data:FormComponentData) => {
        switch (true) {
            case data instanceof TextInputData:return this.renderTextInput(pageKey, data as TextInputData)
            case data instanceof TextAreaInputData:return this.renderTextAreaInput(pageKey, data as TextAreaInputData)
            case data instanceof ContextPhotoInputData:return this.renderContextPhotoInput(pageKey, data as ContextPhotoInputData)
            case data instanceof RichRadioGroupInputData:return this.renderRichRadioInput(pageKey, data as RichRadioGroupInputData)
            case data instanceof SelectInputData:return this.renderSelectInput(pageKey, data as SelectInputData)
            case data instanceof ColorInputData:return this.renderColorInput(pageKey, data as ColorInputData)
            case data instanceof BooleanInputData:return this.renderBooleanInput(pageKey, data as BooleanInputData)
            default:return <div>DEFAULT</div>
        }
    }
    renderPage = (page:FormPageData, index:number) => {
        const cn = classnames("form-controller-page d-flex flex-column", {active:index == this.state.activePageIndex})
        return <div key={page.id} className={cn}>
            {page.componentData.map(cd => this.renderComponent(page.id, cd))}
        </div>
    }
    renderPages = () => {
        return this.props.pages.map(this.renderPage)
    }
    navigateToPage = (index:number) => () => {
        this.setState(() => {
            return {activePageIndex:index}
        })
    }
    renderPageMenu = () => {
        return this.props.pages.map((p, i) => {
            const hasError = !!this.state.pageErrorData[p.id]
            const cn = classnames("menu-button", {error:hasError, active:this.state.activePageIndex == i})
            return <div className={cn} onClick={this.navigateToPage(i)} key={p.id}>
                        <div className="title">
                            <div className="text-truncate">{p.title}</div>
                            {hasError && <i className="error-icon fas fa-exclamation-triangle text-danger "></i>}
                        </div>
                        {p.description && <div className="description secondary-text text-truncate">{p.description}</div>}
                    </div>
        })
    }
    getFormData = (groupByPage:boolean = false) => {
        const object = {}
        const keys = Object.keys(this.pageData) 
        keys.forEach(k => {
            const pageComps = this.pageData[k]
            const pageData = {}
            const pageCompKeys = Object.keys(pageComps)
            pageCompKeys.forEach(pc => {
                const value  = pageComps[pc].getValue()
                if(nullOrUndefined(value))
                    return
                if(groupByPage)
                    pageData[pc] = value
                else 
                    object[pc] = value
            })
            if(groupByPage)
                object[k] = pageData
        })
        return object
    }
    submitForm = () => {
        const data = this.getFormData(false)
        this.props.onFormSubmit && this.props.onFormSubmit(data)
    }
    hasFormError = () => {
        return this.state.pageErrorData && Object.keys(this.state.pageErrorData).length > 0
    }
    trySubmitForm = () => {

        if(!this.state.hasSubmitted)
        {
            this.setState(() => {
                return {hasSubmitted:true}
            }, () => {
                const formErrorData = this.getFormErrorData()
                const hasError = formErrorData && Object.keys(formErrorData).length > 0
                const callBack = hasError ? undefined : this.submitForm
                this.setState(() => {
                    return {pageErrorData:formErrorData}
                }, callBack)
            })
        }
        else {
            this.submitForm()
        }
    }
    render = () => {
        const canSubmit = this.props.status == FormStatus.normal && Object.keys(this.state.pageErrorData).length == 0
        const submitTitle = this.props.status == FormStatus.submitting ? <CircularLoadingSpinner size={24} /> : translate("Submit")
        const showSecondaryView = !!this.state.secondaryView
        const mainContentCn = classnames("main-content", {"d-none":showSecondaryView})
        const title = showSecondaryView ? this.state.secondaryViewTitle : this.props.title
        const header = <div className="title-content d-flex">
                            {showSecondaryView && <Button color="light" className="mr-1" onClick={this.navigateToMainContent}><i className="fas fa-chevron-left"></i></Button>}
                            {title && <div className="align-self-center">{title}</div>}
                        </div>
        const footer = !showSecondaryView &&  <div className="form-buttons">
                                                    <Button disabled={!canSubmit} onClick={this.trySubmitForm}>
                                                    {submitTitle}
                                                    </Button>
                                                </div>
        const genericError = this.getError("detail")
        return <SimpleDialog className="form-controller-modal" didCancel={this.props.didCancel} visible={this.props.visible} header={header} footer={footer}>
                    <div className="form-controller">
                        {genericError && <FormComponentErrorMessage className="d-block" error={genericError} />}
                        <div className={mainContentCn}>
                            <div className="d-flex flex-column main-content-inner">
                                <div className="form-controller-menu">
                                    {this.renderPageMenu()}
                                </div>
                                <div className="form-controller-page-container">
                                    {this.renderPages()}
                                </div>
                            </div>
                        </div>
                        {!!this.state.secondaryView && 
                        <div className="secondary-content">
                            {this.state.secondaryView}
                        </div>
                        }
                    </div>
                </SimpleDialog>
        
    }
}