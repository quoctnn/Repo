import { Types } from '../utilities/Types';
export enum LoginType {
  API = 1,
  NATIVE
}
export interface ApiEndpoint {
  endpoint: string;
  loginType: LoginType;
  websocket: string;
}
const availableApiEndpoints: ApiEndpoint[] = [
  {
    endpoint: 'http://alesund-dev.intra.work:8000',
    loginType: LoginType.NATIVE,
    websocket: 'ws://alesund-dev.intra.work:8000/socket/'
  },
  {
    endpoint: 'http://192.168.15.28:8000',
    loginType: LoginType.NATIVE,
    websocket: 'ws://192.168.15.28:8000/socket/'
  },
  // {
  //   endpoint: 'https://dev.intra.work',
  //   loginType: LoginType.API,
  //   token: null,
  //   sessionid: null,
  //   websocket: null
  // }
];

const INITIAL_STATE = {
  apiEndpoint: 0,
  availableApiEndpoints: availableApiEndpoints,
};
const debug = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SET_API_ENDPOINT:
      return { ...state, apiEndpoint: action.apiEndpoint };
    case Types.SET_AUTORIZATION_DATA:
      var s = {
        ...state,
        availableApiEndpoints: state.availableApiEndpoints.map(
          (content, i) =>
            i === state.apiEndpoint
              ? { ...content, token: action.token, sessionid: action.sessionid }
              : content
        )
      };
      return s;
    default:
      return state;
  }
};
export default debug;
