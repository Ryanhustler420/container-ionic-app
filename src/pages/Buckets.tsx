import _ from 'lodash';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { IBucketSchema, IContainerSchema } from '../utils/schemas';
import { addOutline, chevronDownCircleOutline, logoBitbucket, swapVerticalOutline } from 'ionicons/icons';
import { InputChangeEventDetail, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText, IonTitle, IonToolbar, ItemReorderEventDetail, RefresherEventDetail, IonReorder, IonReorderGroup, IonCard, IonCardHeader, IonCardSubtitle } from '@ionic/react';

import { getDocs, getDoc, doc, deleteDoc, collection, writeBatch } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './Buckets.css';

const screen = { width: 0, name: 'sm' };
const Buckets: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [cid,] = useState(getQueryParam()['cid']);
    const [swaping, setSwapint] = useState(false);
    const [swapped, setSwapped] = useState(false);
    const [container, setContainer] = useState<IContainerSchema>();
    const [buckets, setBuckets] = useState<IBucketSchema[]>([]);
    const [filtered, setFiltered] = useState<IBucketSchema[]>([]);

    const getContainerDetail = _.debounce(() => {
        setLoading(true);
        firebase().then(async e => {
            const container = await getDoc(doc(e.db, collections.CONTAINERS, cid));
            setContainer(container.data() as IContainerSchema);
            getBucketsDetail();
        });
    }, 0);

    const getBucketsDetail = _.debounce(() => {
        firebase().then(async e => {
            getDocs(collection(e.db, collections.CONTAINERS, cid, collections.BUCKETS)).then((querySnapshot) => {
                const buckets = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as IContainerSchema[];
                const set = _.sortBy(buckets as IBucketSchema[], ['index']);
                setBuckets(set);
                setFiltered(set);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, 0);

    const deleteBucket = async (bid: string) => {
        if (!cid) return;
        const response = await Dialog.confirm({
            title: 'Delete',
            message: 'Do you want to delete bucket?',
        });
        if (response.value) {
            setLoading(true);
            firebase().then(async e => {
                await deleteDoc(doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid));
                const set = _.filter(buckets, (e: IBucketSchema) => e.id !== bid);
                setBuckets(set);
                setFiltered(set);
                setLoading(false);
            });
        }
    };

    useEffect(() => { if (!getQueryParam()['cid']) return history.goBack(); }, []);
    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });
    useEffect(() => getContainerDetail(), []);

    const onSwapHandler = async () => {
        setSwapint(!swaping);
        if (swapped) {
            setLoading(true);
            firebase().then(async e => {
                const maxBatchAllow = 500; // NOTE: firebase batch can work for 500 docs at once only
                const total = buckets.length;
                const rounds = Math.ceil(total / maxBatchAllow);

                let cursorAt = 0;
                for (let index = 0; index < rounds; index++) {
                    const batch = writeBatch(e.db);
                    for (let pos = 0; pos < Math.min(maxBatchAllow, total); pos++) {
                        buckets[cursorAt].index = cursorAt;
                        let bid = buckets[cursorAt]?.id;
                        if (bid) {
                            const pointRef = doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid);
                            batch.update(pointRef, buckets[cursorAt] as any);
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
            const rest = _.filter(buckets, (e: IBucketSchema) => e.title.toLowerCase().includes(keyword));
            setFiltered(rest);
        } else setFiltered(buckets);
    };

    function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
        setLoading(true);
        getBucketsDetail();
        event.detail.complete();
    };

    function handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
        // Before complete is called with the items they will remain in the
        // order before the drag
        // console.log('Before complete', droplets);

        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended. Update the items variable to the
        // new order of items
        setBuckets(event.detail.complete(buckets));

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
                    <IonTitle>{container?.title || 'Loading...'}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton>
                            <IonBackButton defaultHref='/' />
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot='end'>
                        <IonSpinner hidden={!loading} />
                        <IonButton color={swaping ? 'warning' : 'light'} onClick={onSwapHandler}>
                            <IonIcon icon={swapVerticalOutline} />
                        </IonButton>
                        <IonButton onClick={() => history.push(`/new_bucket?cid=${cid}&length=${buckets.length}`)}>
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
                    <IonInput placeholder='Search Buckets' className='font-bold' onIonChange={onFilterHandler} />
                    {buckets?.length} &nbsp; <IonIcon icon={logoBitbucket} />
                </IonItem>
                {!loading && filtered.length === 0 && <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>Nothing just 💩 here...</IonCardSubtitle>
                    </IonCardHeader>
                </IonCard>}
                <IonItemDivider></IonItemDivider>
                <IonList className="ion-no-padding">
                    <IonReorderGroup disabled={!swaping} onIonItemReorder={handleReorder} className='space-y-5'>
                        {_.map(filtered, (e: IBucketSchema, i) => (
                            <IonItemSliding key={i} ref={e => e?.closeOpened()}>
                                <IonItemOptions side="end">
                                    <IonItemOption color="dark" onClick={() => { deleteBucket(e?.id || '') }}>Delete</IonItemOption>
                                    <IonItemOption color="dark" onClick={() => history.push(`/edit_bucket?cid=${cid}&bid=${e?.id}`)}>Edit</IonItemOption>
                                </IonItemOptions>
                                <IonItem button onClick={() => history.push(`/droplets?cid=${cid}&bid=${e?.id}`)}>
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
    )
}

export default Buckets;