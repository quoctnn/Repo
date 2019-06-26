import * as React from 'react'
import classnames from "classnames"
import "./ProjectListItem.scss"
import { Project, ContextNaturalKey } from '../../types/intrasocial_types';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    project:Project
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class SimpleProjectListItem extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
            
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.project != this.props.project
        return ret

    }
    render()
    {
        const {project, className, children, ...rest} = this.props
        const projectClass = classnames("project-list-item", className)
        return (<IntraSocialLink to={project} type={ContextNaturalKey.PROJECT} {...rest} className={projectClass}>
                    <div className="title text-truncate">{project.name}</div>
                </IntraSocialLink>)
    }
}