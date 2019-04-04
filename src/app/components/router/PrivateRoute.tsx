
import * as React from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import Routes from "../../utilities/Routes";
export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        AuthenticationManager.isSignedIn ? <Component {...props} /> : <Redirect to={{
            pathname: Routes.SIGNIN,
            state: { from: props.location }
          }} />
    )} />
  )