import _ from 'lodash';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import Capacitor from '../utils/Capacitor';
import { Resizer } from "../components/Resizer";
import React, { useEffect, useState } from 'react';
import { IContainerSchema } from '../utils/schemas';
import { addOutline, chevronDownCircleOutline, cubeOutline, swapVerticalOutline } from "ionicons/icons";
import { InputChangeEventDetail, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText, IonTitle, IonToolbar, ItemReorderEventDetail, RefresherEventDetail, IonReorderGroup, IonReorder, IonCard, IonCardHeader, IonCardSubtitle } from '@ionic/react';

import { collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
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
  const [swaping, setSwapint] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [containers, setContainers] = useState<IContainerSchema[]>([]);
  const [filtered, setFiltered] = useState<IContainerSchema[]>([]);

  const getContainersDetail = _.debounce(() => {
    setLoading(true);
    firebase().then(async e => {
      getDocs(collection(e.db, collections.CONTAINERS)).then((querySnapshot) => {
        const containers = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as IContainerSchema[];
        const set = _.sortBy(containers as IContainerSchema[], ['index']);
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

  const onSwapHandler = async () => {
    setSwapint(!swaping);
    if (swapped) {
      setLoading(true);
      firebase().then(async e => {
        const maxBatchAllow = 500; // NOTE: firebase batch can work for 500 docs at once only
        const total = containers.length;
        const rounds = Math.ceil(total / maxBatchAllow);

        let cursorAt = 0;
        for (let index = 0; index < rounds; index++) {
          const batch = writeBatch(e.db);
          for (let pos = 0; pos < Math.min(maxBatchAllow, total); pos++) {
            containers[cursorAt].index = cursorAt;
            let cid = containers[cursorAt]?.id;
            if (cid) {
              const pointRef = doc(e.db, collections.CONTAINERS, cid);
              batch.update(pointRef, containers[cursorAt] as any);
              cursorAt++;
            }
          }
          await batch.commit();
        }
        setLoading(false);
        setSwapped(false);
      }).catch(() => {
        Capacitor.toast('Something went wrong in batching process');
      });
    }
  };

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

  function handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
    // Before complete is called with the items they will remain in the
    // order before the drag
    // console.log('Before complete', droplets);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    setContainers(event.detail.complete(containers));

    // After complete is called the items will be in the new order
    // console.log('After complete', droplets);
    setSwapped(true);
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
            <IonButton color={swaping ? 'warning' : 'light'} onClick={onSwapHandler}>
              <IonIcon icon={swapVerticalOutline} />
            </IonButton>
            <IonButton onClick={() => history.push(`/new_container?length=${containers.length}`)}>
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
        {!loading && filtered.length === 0 && <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Nothing just 💩 here...</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>}
        <IonItemDivider></IonItemDivider>
        <IonList className="ion-no-padding">
          <IonReorderGroup disabled={!swaping} onIonItemReorder={handleReorder} className='space-y-5'>
            {_.map(filtered, (e, i) => (
              <IonItemSliding key={i} ref={e => e?.closeOpened()}>
                <IonItemOptions side="end">
                  <IonItemOption color="dark" onClick={() => { deleteContainer(e?.id || '') }}>Delete</IonItemOption>
                  <IonItemOption color="dark" onClick={() => history.push(`/edit_container?cid=${e?.id}`)}>Edit</IonItemOption>
                </IonItemOptions>
                <IonItem button onDoubleClick={() => { console.log('pussy'); }} onClick={() => history.push(`/buckets?cid=${e?.id}`)}>
                  <IonLabel>
                    <IonText color={"primary"} className='font-bold capitalize'>{e?.title}</IonText>
                    <br />
                    <small className='capitalize ion-text-wrap'>{e?.subtitle}</small>
                  </IonLabel>
                </IonItem>
                <IonReorder slot="end"></IonReorder>
              </IonItemSliding>
            ))}
          </IonReorderGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Containers;
