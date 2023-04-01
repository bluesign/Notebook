import React from 'react';
import Playground from '~/components/pages/Playground';
import NotFoundPage from "~/components/pages/NotFoundPage";
import './App.css';
import {Switch, Router, Route} from 'react-router-dom';
import { createBrowserHistory } from 'history'
import {loadConfig} from "~/state";

const history = createBrowserHistory();


const App = () => {
    loadConfig()
    return (
        <Router history={history}>

            <Switch>

                <Route
                    path={[
                        "/",
                        "/notebook/:snippetID",
                    ]}
                    exact
                    component={Playground}
                />
                <Route path="*" component={NotFoundPage}/>
            </Switch>
        </Router>

    );
}

export default App;
