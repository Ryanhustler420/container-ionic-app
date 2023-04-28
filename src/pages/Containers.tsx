import _ from 'lodash';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import { Resizer } from "../components/Resizer";
import React, { useEffect, useState } from 'react';
import { IContainerSchema } from '../utils/schemas';
import { addOutline, chevronDownCircleOutline, cubeOutline } from "ionicons/icons";
import { InputChangeEventDetail, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText, IonTitle, IonToolbar, RefresherEventDetail } from '@ionic/react';

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './Containers.css';

const screen = { width: 0, name: 'sm' };
const Containers: React.FC<{
  onShowTabs: () => void;
  onHideTabs: () => void;
  rendering: boolean;
}> = props => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [containers, setContainers] = useState<IContainerSchema[]>([]);
  const [filtered, setFiltered] = useState<IContainerSchema[]>([]);

  const getContainersDetail = _.debounce(() => {
    setLoading(true);
    firebase().then(async e => {
      getDocs(collection(e.db, collections.CONTAINERS)).then((querySnapshot) => {
        const containers = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as IContainerSchema[];
        const set = containers as IContainerSchema[];
        setContainers(set);
        setFiltered(set);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, 0);

  const deleteContainer = async (cid: string) => {
    if (!cid) return;
    const response = await Dialog.confirm({
      title: 'Delete',
      message: 'Do you want to delete container?',
    });
    if (response.value) {
      setLoading(true);
      firebase().then(async e => {
        await deleteDoc(doc(e.db, `${collections.CONTAINERS}/${cid}`));
        const set = _.filter(containers, (e: IContainerSchema) => e.id !== cid);
        setContainers(set);
        setFiltered(set);
        setLoading(false);
      });
    }
  };

  useEffect(() => { if (props.rendering) { props.onShowTabs(); } });
  useEffect(() => { getContainersDetail(); }, []);

  const onFilterHandler = (e: CustomEvent<InputChangeEventDetail>) => {
    const keyword = e.detail.value;
    if (keyword) {
      const rest = _.filter(containers, (e: IContainerSchema) => e.title.toLowerCase().includes(keyword));
      setFiltered(rest);
    } else setFiltered(containers);
  };

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setLoading(true);
    getContainersDetail();
    event.detail.complete();
  };

  const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
    screen.width = width as number;
    screen.name = name as string;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Firebase</IonTitle>
          <IonButtons slot="end">
            <IonSpinner hidden={!loading} />
            <IonButton onClick={() => history.push('/new_container')}>
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Resizer onChange={breakPointTrigger} />
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing...">
          </IonRefresherContent>
        </IonRefresher>
        <IonItem button>
          <IonInput placeholder='Search Containers' className='font-bold' onIonChange={onFilterHandler} />
          {containers?.length} &nbsp; <IonIcon icon={cubeOutline} />
        </IonItem>
        <IonItemDivider></IonItemDivider>
        <IonList className="ion-no-padding">
          {_.map(filtered, (e, i) => (
            <IonItemSliding key={i} ref={e => e?.closeOpened()}>
              <IonItemOptions side="end">
                <IonItemOption color="dark" onClick={() => { deleteContainer(e?.id || '') }}>Delete</IonItemOption>
                <IonItemOption color="dark" onClick={() => history.push(`/edit_container?cid=${e?.id}`)}>Edit</IonItemOption>
              </IonItemOptions>
              <IonItem button onClick={() => history.push(`/buckets?cid=${e?.id}`)}>
                <IonLabel>
                  <IonText color={"primary"} className='font-bold'>{e?.title}</IonText>
                  <br />
                  <small className='truncate'>{e?.subtitle}</small>
                </IonLabel>
              </IonItem>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Containers;
