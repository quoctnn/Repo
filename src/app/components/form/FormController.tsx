import * as React from 'react';
import { TextInput, TextAreaInput, PhotoUploadPreview } from './FormPageControllerComponent';
import "./FormController.scss"
import { Button } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import classnames from 'classnames';
import { ContextNaturalKey, RequestErrorData } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../general/CircularLoadingSpinner';
export enum FormStatus{
    submitting, deactivated, normal
}
export enum FormComponentType{
    text, textArea, file
}
export type FormComponentArgument = {
    title:string
    id:string
    value?:string
    isRequired?:boolean
    placeholder?:string
    contextNaturalKey?:ContextNaturalKey
    contextObjectId?:number
    error?:string
    onValueChanged?:(id:string, value?:any) => void
    onRequestNavigation?:(title?:string, toView?:React.ReactNode) => void
}
export type FormComponentData = {
    arguments:FormComponentArgument
    type:FormComponentType
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
    formError:RequestErrorData
}
type State = {
    activePageIndex:number
    pageErrorData:{[key:string]:boolean}
    secondaryView:React.ReactNode
    secondaryViewTitle:string
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
        }
    }
    componentDidMount = () => {
        this.updateFormErrors()
    }
    getFormErrorData = () => {
        const error = {}
        const pKeys = Object.keys(this.pageData)
        pKeys.forEach(pk => {
            const cKeys = Object.keys(this.pageData[pk])
            const isValid = cKeys.every(ck => this.pageData[pk][ck].isValid())
            if(!isValid)
            {
                error[pk] = true
            }
        })
        return error
    }
    updateFormErrors = () => {
        const formErrorData = this.getFormErrorData()
        this.setState(() => {
            return {pageErrorData:formErrorData}
        })
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
        page[key] = ref
        this.pageData[pageKey] = page
    }
    getError = (key:string) => {
        if(this.props.formError && this.props.formError.data && typeof this.props.formError.data == "object")
        {
            return this.props.formError.data[key]
        }
        return null
    }
    renderTextInput = (pageKey:string, args:FormComponentArgument) => {
        args.error = this.getError(args.id)
        return <TextInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderTextAreaInput = (pageKey:string, args:FormComponentArgument) => {
        args.error = this.getError(args.id)
        return <TextAreaInput ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderFileInput = (pageKey:string, args:FormComponentArgument) => {
        args.error = this.getError(args.id)
        return <PhotoUploadPreview ref={this.setFormRef(pageKey, args.id)} key={args.id} {...args} onValueChanged={this.handleValueChanged(pageKey)} onRequestNavigation={this.handleRequestNavigation} />
    }
    renderComponent = (pageKey:string, data:FormComponentData) => {
        switch (data.type) {
            case FormComponentType.text:return this.renderTextInput(pageKey, data.arguments)
            case FormComponentType.textArea:return this.renderTextAreaInput(pageKey, data.arguments)
            case FormComponentType.file:return this.renderFileInput(pageKey, data.arguments)
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
                            <div>{p.title}</div>
                            {hasError && <i className="error-icon fas fa-exclamation-triangle text-danger"></i>}
                        </div>
                        {p.description && <div className="description secondary-text">{p.description}</div>}
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
                const comp  = pageComps[pc]
                if(groupByPage)
                    pageData[pc] = comp.getValue()
                else 
                    object[pc] = comp.getValue()
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
    render = () => {
        const canSubmit = this.props.status == FormStatus.normal && Object.keys(this.state.pageErrorData).length == 0
        const submitTitle = this.props.status == FormStatus.submitting ? <CircularLoadingSpinner size={24} /> : translate("Submit")
        const showSecondaryView = !!this.state.secondaryView
        const mainContentCn = classnames("main-content", {"d-none":showSecondaryView})
        const title = showSecondaryView ? this.state.secondaryViewTitle : this.props.title
        return <div className="form-controller">
                    <div className="title-content d-flex">
                    {showSecondaryView && <Button color="light" className="mr-1" onClick={this.navigateToMainContent}><i className="fas fa-chevron-left"></i></Button>}
                    {title && <div className="form-title">{title}</div>}
                    </div>
                    <div className={mainContentCn}>
                        <div className="d-flex">
                            <div className="form-controller-menu">
                                {this.renderPageMenu()}
                            </div>
                            <div className="form-controller-page-container">
                                {this.renderPages()}
                            </div>
                        </div>
                        <div className="form-buttons">
                            <Button disabled={!canSubmit} onClick={this.submitForm}>
                            {submitTitle}
                            </Button>
                        </div>
                    </div>
                    {!!this.state.secondaryView && 
                    <div className="secondary-content">
                        {this.state.secondaryView}
                    </div>
                    }
                </div>
        
    }
}