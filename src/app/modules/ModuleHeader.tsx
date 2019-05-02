import * as React from "react";
import classnames from "classnames"
import CircularLoadingSpinner from "../components/general/CircularLoadingSpinner";

export type Props =
{
    headerTitle?:string|JSX.Element
    loading?:boolean
}

export default class ModuleHeader extends React.Component<Props & React.HTMLAttributes<any>, {}> {
    renderLoading = () => {
        if (this.props.loading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    render() {
        const {className, headerTitle, loading, children, ...rest} = this.props
        const cn = classnames("module-header", className)
        return(
            <div {...rest} className={cn}>
                    <div className="flex-grow-1 text-truncate d-flex align-items-center">
                    {headerTitle &&
                        <div className="text-truncate module-header-title-left">{headerTitle}</div>
                    }
                    {this.renderLoading()}
                    <div className="spacer flex-grow-1 flex-shrink-1"></div>
                </div>
            {children}
            </div>
        );
    }
}
