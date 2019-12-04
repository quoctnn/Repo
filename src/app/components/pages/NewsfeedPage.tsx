import * as React from "react";
import classnames from "classnames"
import NewsfeedComponent from "../../modules/newsfeed/NewsfeedComponent";
import "./NewsfeedPage.scss"
import { RouteComponentProps } from "react-router";
export type Props =
{
}

export default class NewsfeedPage extends React.Component<Props & React.HTMLAttributes<any> & RouteComponentProps<any>, {}> {
    render() {
        const {className,staticContext, match, history, location,...rest} = this.props
        const cn = classnames("newsfeed-page", className)
        const u = new URLSearchParams(location.search)
        const val = u.get("includeSubContext")
        const includeSubContext = val ? val.toLocaleLowerCase() == "true" : true
        return(<div {...rest} className={cn}>
                    <NewsfeedComponent
                        includeSubContext={includeSubContext}
                        contextNaturalKey={match.params.contextNaturalKey}
                        contextObjectId={match.params.contextObjectId}
                        scrollParent={window}
                        //authenticatedProfile={null}
                        />
                </div>
        );
    }
}
