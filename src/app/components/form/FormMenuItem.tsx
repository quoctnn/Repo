import * as React from "react"
import FormController from "./FormController"
import classnames from 'classnames';

type FormMenuItemProps = {
    form:FormController
    pageId:string
    title:string
    description?:string
}
type FormMenuItemState = {
    
}
export class FormMenuItem extends React.Component<FormMenuItemProps, FormMenuItemState> {
    navigateToPage = () => {
        const {form} = this.props
        form && form.navigateToPageId(this.props.pageId)
    }
    render = () => {
        const {form, description, title} = this.props
        if(!form)
            return null
        const hasError = form.hasPageErrorData(this.props.pageId)
        let activeIndex = form.state.activePageIndex
        let currentIndex = form.findPageIndex(this.props.pageId)
        const cn = classnames("menu-button", {error:hasError, active:activeIndex == currentIndex})
        return <div className={cn} onClick={this.navigateToPage}>
                    <div className="title">
                        <div className="text-truncate">{title}</div>
                        {hasError && <i className="error-icon fas fa-exclamation-triangle text-danger "></i>}
                    </div>
                    {description && <div className="description secondary-text text-truncate">{description}</div>}
                </div>
    }
}
