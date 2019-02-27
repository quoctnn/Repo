import * as React from "react";
import classnames from "classnames"
import NewsfeedComponent from "../../NewsfeedComponent";
import "./NewsfeedPage.scss"
import { RouteComponentProps } from "react-router";
export type Props = 
{
}

export default class NewsfeedPage extends React.Component<Props & React.HTMLAttributes<any> & RouteComponentProps<any>, {}> {
    render() {
        const {className,staticContext, match, history, location,...rest} = this.props
        const cn = classnames("newsfeed-page", className)
        return(<div {...rest} className={cn}>
                    <NewsfeedComponent scrollParent={window} />
                </div>
        );
    }
}
