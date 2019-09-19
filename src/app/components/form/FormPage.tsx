import * as React from "react"
import FormController from "./FormController"
import classnames from 'classnames';

type FormPageProps = {
    pageId:string
    form:FormController
    render:(pageId:string, form:FormController) => React.ReactNode
}
type FormPageState = {
    
}
export class FormPage extends React.Component<FormPageProps, FormPageState> {
    render = () => {
        const {form} = this.props
        let activeIndex = -2
        let currentIndex = -1
        if(form)
        {
            currentIndex = form.findPageIndex(this.props.pageId)
            activeIndex = form.state.activePageIndex
        }
        const cn = classnames("form-controller-page d-flex flex-column", {active:currentIndex == activeIndex})
        return <div className={cn}>
                {this.props.form && this.props.render(this.props.pageId, this.props.form)}
                </div>
    }
}
