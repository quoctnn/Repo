import * as React from 'react';
import "./FormController.scss"
import { Button, FormFeedback } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import classnames from 'classnames';
import { ContextNaturalKey, RequestErrorData } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../general/CircularLoadingSpinner';
import SimpleDialog from '../general/dialogs/SimpleDialog';
import { nullOrUndefined } from '../../utilities/Utilities';
import { FormPage } from './FormPage';


export const FormComponentErrorMessage = (props:{errors?:{[key:string]:string}, errorKey?:string, className?:string}) => {
    if(!props.errors)
        return null
    const errors:string[] = []
    if(props.errorKey)
    {
        const e = props.errors[props.errorKey]
        if(e)
            errors.push(e)
    }
    else {
        const keys = Object.keys( props.errors )
        keys.forEach(k => {
            const val = props.errors[k]
            if(val)
                errors.push(val)
        })
    }
    if(errors.length > 0)
    {
        return <>
        {errors.map((e, i) => <FormFeedback key={i} className={props.className} tooltip={false}><i className="error-icon fas fa-exclamation-triangle"></i>{" "}{e}</FormFeedback>)}
        </>
    }
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
    onValueChanged?:(id:string, value:any, isRequired:boolean) => void
    onRequestNavigation?:(title?:string, toView?:React.ReactNode) => void
}
export interface FormComponentBase{
    isValid:() => boolean
    getValue:() => any
}
type FormContent = {
    menuItems:React.ReactNode[],
    pages:React.ReactNode[],
}
type Props = {
    title?:string
    onFormSubmit?:(data:{[key:string]:string}) => void
    onValueChanged?:(id:string, value?:any) => void
    status:FormStatus
    didCancel:() => void
    formErrors:RequestErrorData[]
    visible:boolean
    render:(form:FormController) => FormContent
    className?:string
    modalClassName?:string
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
    content:FormContent = {pages:[], menuItems:[]}
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
    findPageIndex = (pageId:string) => {
        const pages = this.content.pages as FormPage[]
        return pages.findIndex(p => p.props.pageId == pageId)
    }
    updateFormErrors = (completion?:() => void) => {
        const formErrorData = this.getFormErrorData()
        this.setState(() => {
            return {pageErrorData:formErrorData}
        },completion)
    }
    handleValueChanged = (pageKey:string) =>  (id:string, value:any, isRequired:boolean) => {
        if(isRequired)
        {
            console.log("handleValueChanged", id, value)
            this.updateFormErrors()
        }
        this.props.onValueChanged && this.props.onValueChanged(id, value)
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
    setFormRef = (pageKey:string) => (ref:ComponentData) => {
        const page = this.pageData[pageKey] || {}
        if(!nullOrUndefined(ref))
        {
            page[ref.props.id] = ref
        }
        this.pageData[pageKey] = page
    }
    getErrors = (keys:string[]):{[key:string]:string} => {
        if(this.props.formErrors)
        {
            let errors:{[key:string]:string} = {}
            this.props.formErrors.forEach(fec => 
                {
                    const e = fec.getErrorMessagesForFields(keys)
                    if(e)
                    {
                        errors = Object.assign(errors, e)
                    }
                })
            return errors
        }
        return null
    }
    navigateToPage = (index:number) => () => {
        this.setState(() => {
            return {activePageIndex:index}
        })
    }
    navigateToPageId = (pageId:string) => {
        const i = this.findPageIndex(pageId)
        if(i > -1)
        {
            this.setState(() => {
                return {activePageIndex:i}
            })
        }
    }
    hasPageErrorData = (pageId:string) => {
        return !!this.state.pageErrorData[pageId]
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
    hasSubmitted = () => {
        return this.state.hasSubmitted
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
        const footer = !showSecondaryView && this.props.onFormSubmit && <div className="form-buttons">
                                                    <Button disabled={!canSubmit} onClick={this.trySubmitForm}>
                                                    {submitTitle}
                                                    </Button>
                                                </div>
        const genericError = this.getErrors(["detail", "non_field_errors"])
        this.content = this.props.render(this)
        const {menuItems, pages} = this.content
        return <SimpleDialog className={classnames("form-controller-modal", this.props.modalClassName)} didCancel={this.props.didCancel} visible={this.props.visible} header={header} footer={footer}>
                    <div className={classnames("form-controller", this.props.className)}>
                        {genericError && <FormComponentErrorMessage className="d-block" errors={genericError} />}
                        <div className={mainContentCn}>
                            <div className="d-flex flex-column main-content-inner">
                                {menuItems.length > 0 && <div className="form-controller-menu">
                                    {menuItems}
                                </div>}
                                <div className="form-controller-page-container">
                                    {pages}
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