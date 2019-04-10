import {Types} from "../utilities/Types"


export class CommunityProjects
{
    total:number
    community_id: number
    projects:number[]
    constructor(projects:number[], community_id:number, total:number)
    {
        this.projects = projects
        this.community_id = community_id
        this.total = total
    }
    appendProjects(projects:number[])
    {
        this.projects.concat(projects)
    }
}
const projectsArray:CommunityProjects[] = [
]


const INITIAL_STATE = { projects: projectsArray}
const projectListCache = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_COMMUNITY_PROJECTS_CACHE:
        {
            let arr = state.projects.filter( (content) => content.community_id != action.community  )
            arr.push(new CommunityProjects(action.projects, action.community, action.total))
            return { ...state , projects: arr}
        }
        case Types.APPEND_COMMUNITY_PROJECTS_CACHE:
        {
            let arr = state.projects.map( (content) => content.community_id === action.community ? new CommunityProjects(content.projects.concat(action.projects), content.community_id, content.total)  : content )
            return { ...state, projects: arr}
        }
        case Types.RESET_COMMUNITY_PROJECTS_CACHE:
            return { projects: []}
        default:
            return state;
    }
}
export default projectListCache