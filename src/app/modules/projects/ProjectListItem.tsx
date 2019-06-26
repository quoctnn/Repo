import * as React from 'react'
import classnames from "classnames"
import "./ProjectListItem.scss"
import { Project, ContextNaturalKey } from '../../types/intrasocial_types';
import { SecureImage } from '../../components/general/SecureImage';
import { projectCover } from '../../utilities/Utilities';
import { translate } from '../../localization/AutoIntlProvider';
import { IntraSocialLink } from '../../components/general/IntraSocialLink';

type OwnProps = {
    project:Project
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class ProjectListItem extends React.Component<Props, State> {  
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
        const cover = projectCover(project, true)
        return (<IntraSocialLink to={project} type={ContextNaturalKey.PROJECT} {...rest} className={projectClass}>
                    <div className="drop-shadow">
                        <div className="top">
                            <SecureImage className="img" setBearer={true} setAsBackground={true} url={cover}/>
                            <div className="title-row d-flex align-items-center flex-row">
                                <div className="theme-box theme-bg-gradient flex-shrink-0">
                                    {project.members_count || "--"}&nbsp;
                                    <i className="fa fa-user"></i>
                                </div>
                                <div className="title text-truncate">{project.name}</div>
                            </div>
                        </div>
                        <div className="bottom d-flex align-items-center flex-row justify-content-around">
                            <div className="item">
                                <div className="item-top">
                                    <b>{project.tasks_assigned}&nbsp;</b>{translate("common.tasks")}</div>
                                <div className="item-bottom">{translate("project.item.tasks.assigned")}</div>
                            </div>
                            <div className="item">
                                <div className="item-top">
                                    <b>{project.tasks_responsible}&nbsp;</b>{translate("common.tasks")}</div>
                                <div className="item-bottom">{translate("project.item.tasks.responsible")}</div>
                            </div>
                        </div>
                    </div>
                </IntraSocialLink>)
    }
}