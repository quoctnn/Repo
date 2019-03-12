import {Types} from "../utilities/Types"
import { Project } from "../types/intrasocial_types2";

const projectsArray:Project[] = []

const INITIAL_STATE = { projects: projectsArray}
const projectStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.PROJECTSTORE_ADD_PROJECTS:
            {
                if(action.projects.length == 0)
                    return state;
                const combinedArrays:Project[] = [...state.projects, ...action.projects].sort((a:Project, b:Project) => {
                    return a.id - b.id
                })
                const finalArray = combinedArrays.reduce((prev, cur, index, array) => {

                    let toReturn
                    const lastObj = prev[prev.length - 1]
                    if(lastObj.id !== cur.id){
                      toReturn = prev.concat(cur)
                    }
                    else if (new Date(lastObj.updated_at) < new Date(cur.updated_at))
                    {
                      prev.splice((prev.length - 1), 1, cur)
                      toReturn = prev
                    }
                    else {
                     toReturn = prev
                    }

                    return toReturn
                  }, [combinedArrays[0]])
                return { projects: finalArray }
            }
        case Types.PROJECTSTORE_ADD_PROJECT:
            let hasProject = state.projects.find((c) => {
                return c.id == action.project.id
            })
            if(hasProject)
            {
                return { ...state, projects: state.projects.map( (content) => content.id === action.project.id ? action.project : content )}
            }
            let s = { ...state, projects: state.projects.map((c) => c)}
            s.projects.push(action.project)
            return s
        case Types.PROJECTSTORE_RESET:
            return {projects:[]}
        default:
            return state;
    }
}
export default projectStore