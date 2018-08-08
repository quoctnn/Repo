import {Types} from "../utilities/Types"

//cart
export const setBackendEndpoint = (endpoint) => ({
    type: Types.SET_BACKEND_ENDPOINT,
    endpoint: endpoint
})