import _ from "lodash";
import AuthState from "./utils/common/auth-state";
import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import HistoryMethodsIPC, { IHistoryMethodsIPC } from "./components/HistoryMethodsIPC";

import { cubeOutline, logoFirebase } from 'ionicons/icons';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';

import Buckets from "./pages/Buckets";
import Firebase from "./pages/Firebase";
import Droplets from "./pages/Droplets";
import NewBucket from "./pages/NewBucket";
import EditBucket from "./pages/EditBucket";
import NewDroplet from "./pages/NewDroplet";
import Containers from './pages/Containers';
import EditDroplet from "./pages/EditDroplet";
import NewContainer from "./pages/NewContainer";
import EditContainer from "./pages/EditContainer";

import ApplicationContextProvider from './data/ApplicationContextProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import "./theme/theme.css";

setupIonicReact();

// these methods should go inside a file name.. utilitys.ts
export const currentPath = () => window.location.pathname;
export const components = {
  containers: {
    path: "/",
    Component: Containers,
  },
  firebase: {
    path: "/firebase",
    Component: Firebase,
  },
  newContainer: {
    path: "/new_container",
    Component: NewContainer
  },
  editContainer: {
    path: "/edit_container",
    Component: EditContainer,
  },
  buckets: {
    path: "/buckets",
    Component: Buckets,
  },
  newBucket: {
    path: "/new_bucket",
    Component: NewBucket,
  },
  editBucket: {
    path: "/edit_bucket",
    Component: EditBucket,
  },
  droplets: {
    path: "/droplets",
    Component: Droplets,
  },
  newDroplet: {
    path: "/new_droplet",
    Component: NewDroplet,
  },
  editDroplet: {
    path: "/edit_droplet",
    Component: EditDroplet,
  },
};
const App: React.FC = () => {
  const authState = new AuthState();
  const historyMethodsIPCRef = React.createRef<IHistoryMethodsIPC>();

  const [visibleMainTabs, setVisibleMainTabs] = useState(false);
  const showTabsHandler = _.debounce(() => setVisibleMainTabs(true), 1);
  const hideTabsHandler = _.debounce(() => setVisibleMainTabs(false), 1);

  const getRoutes = () => {
    return (
      <IonRouterOutlet id="main-drawer">
        <Route path={components.buckets.path} render={() => (<components.buckets.Component rendering={components.buckets.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.firebase.path} render={() => (<components.firebase.Component rendering={components.firebase.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.droplets.path} render={() => (<components.droplets.Component rendering={components.droplets.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.newBucket.path} render={() => (<components.newBucket.Component rendering={components.newBucket.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.editBucket.path} render={() => (<components.editBucket.Component rendering={components.editBucket.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.newDroplet.path} render={() => (<components.newDroplet.Component rendering={components.newDroplet.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.editDroplet.path} render={() => (<components.editDroplet.Component rendering={components.editDroplet.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.containers.path} render={() => (<components.containers.Component rendering={components.containers.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.newContainer.path} render={() => (<components.newContainer.Component rendering={components.newContainer.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Route path={components.editContainer.path} render={() => (<components.editContainer.Component rendering={components.editContainer.path === currentPath()} onHideTabs={hideTabsHandler} onShowTabs={showTabsHandler} />)} exact />
        <Redirect to={components.containers.path} />
      </IonRouterOutlet>
    );
  };

  useEffect(() => {
    // let isAuthenticated = authState.validateUser();
    // if (!isAuthenticated) historyMethodsIPCRef.current?.clearAndGoto(components.login.path);
  }, []);

  return (
    <IonApp>
      <ApplicationContextProvider>
        <IonReactRouter>
          {/* {getRoutes()} */}
          <HistoryMethodsIPC ref={historyMethodsIPCRef} />
          <React.Suspense fallback={<IonSpinner />}>
            <IonTabs>
              {getRoutes()}
              <IonTabBar slot="bottom" hidden={!visibleMainTabs}>
                <IonTabButton tab="firebase" href={components.firebase.path}>
                  <IonIcon icon={logoFirebase} />
                  <IonLabel>Firebase</IonLabel>
                </IonTabButton>
                {/* make sure that the home component or / should be at the bottom always */}
                <IonTabButton tab="containers" href={components.containers.path}>
                  <IonIcon icon={cubeOutline} />
                  <IonLabel>Containers</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </React.Suspense>
        </IonReactRouter>
      </ApplicationContextProvider>
    </IonApp>
  )
};

export default App;
