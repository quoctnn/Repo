import {Types} from "../utilities/Types"
import { Task } from "../types/intrasocial_types";

const tasksArray:Task[] = []

const INITIAL_STATE = { tasks: tasksArray}
const taskStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.TASKSTORE_ADD_TASKS:
            {
                if(action.tasks.length == 0)
                    return state;
                const combinedArrays:Task[] = [...state.tasks, ...action.tasks].sort((a:Task, b:Task) => {
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
                return { tasks: finalArray }
            }
        case Types.TASKSTORE_ADD_TASK:
            let hasTask = state.tasks.find((c) => {
                return c.id == action.task.id
            })
            if(hasTask)
            {
                return { ...state, tasks: state.tasks.map( (content) => content.id === action.task.id ? action.task : content )}
            }
            let s = { ...state, tasks: state.tasks.map((c) => c)}
            s.tasks.push(action.task)
            return s
        case Types.TASKSTORE_RESET:
            return {tasks:[]}
        default:
            return state;
    }
}
export default taskStore