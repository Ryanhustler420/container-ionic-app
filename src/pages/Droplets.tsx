import _ from 'lodash';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { IDropletSchema, IBucketSchema } from '../utils/schemas';
import InputBoxComponent from '../components/common/InputBoxComponent';
import { addOutline, chevronDownCircleOutline, swapVerticalOutline, waterOutline } from 'ionicons/icons';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonItem, IonItemDivider, IonList, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar, RefresherEventDetail, IonReorder, IonReorderGroup, ItemReorderEventDetail, IonRippleEffect, IonInput, InputChangeEventDetail } from '@ionic/react';

import { getDocs, getDoc, doc, deleteDoc, collection, writeBatch } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './Droplets.css';

const screen = { width: 0, name: 'sm' };
const Droplets: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [cid,] = useState(getQueryParam()['cid']);
    const [bid,] = useState(getQueryParam()['bid']);
    const [loading, setLoading] = useState(false);
    const [swaping, setSwapint] = useState(false);
    const [swapped, setSwapped] = useState(false);
    const [bucket, setBucket] = useState<IBucketSchema>();
    const [droplets, setDroplets] = useState<IDropletSchema[]>([]);
    const [filtered, setFiltered] = useState<IDropletSchema[]>([]);

    const getBucketsDetail = _.debounce(() => {
        setLoading(true);
        firebase().then(async e => {
            const bucket = await getDoc(doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid));
            setBucket(bucket.data() as IBucketSchema);
            getDropletsDetail();
        });
    }, 0);

    const getDropletsDetail = _.debounce(() => {
        firebase().then(async e => {
            getDocs(collection(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS)).then((querySnapshot) => {
                const buckets = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as IDropletSchema[];
                const set = _.sortBy(buckets as IDropletSchema[], ['index']);
                setDroplets(set);
                setFiltered(set);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, 0);

    const deleteDroplet = async (did: string) => {
        if (!did) return;
        const response = await Dialog.confirm({
            title: 'Delete',
            message: 'Do you want to delete droplet?',
        });
        if (response.value) {
            setLoading(true);
            firebase().then(async e => {
                await deleteDoc(doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS, did));
                const set = _.filter(droplets, (e: IDropletSchema) => e.id !== did);
                setDroplets(set);
                setFiltered(set);
                setLoading(false);
            });
        }
    };

    useEffect(() => { if (!getQueryParam()['cid'] || !getQueryParam()['bid']) return history.goBack(); }, []);
    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });
    useEffect(() => getBucketsDetail(), []);

    useEffect(() => {
        document.addEventListener('keyup', hotkeys, false);
        return () => document.removeEventListener('keyup', hotkeys, false);
    }, []);

    function hotkeys(e: KeyboardEvent) {
        if (e.ctrlKey && e.altKey && e.key === 'n') {
            e.preventDefault();
            history.push(`/new_droplet?cid=${cid}&bid=${bid}&length=${droplets.length}`);
        } else if (e.key === 'Escape') { history.goBack(); }
    };

    function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
        setLoading(true);
        getDropletsDetail();
        event.detail.complete();
    };

    const onSwapHandler = async () => {
        setSwapint(!swaping);
        if (swapped) {
            setLoading(true);
            firebase().then(async e => {
                const maxBatchAllow = 500; // NOTE: firebase batch can work for 500 docs at once only
                const total = droplets.length;
                const rounds = Math.ceil(total / maxBatchAllow);

                let cursorAt = 0;
                for (let index = 0; index < rounds; index++) {
                    const batch = writeBatch(e.db);
                    for (let pos = 0; pos < Math.min(maxBatchAllow, total); pos++) {
                        droplets[cursorAt].index = cursorAt;
                        let did = droplets[cursorAt]?.id;
                        if (did) {
                            const pointRef = doc(e.db, collections.CONTAINERS, cid, collections.BUCKETS, bid, collections.DROPLETS, did);
                            batch.update(pointRef, droplets[cursorAt] as any);
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
            const rest = _.filter(droplets, (e: IDropletSchema) => e.title.toLowerCase().includes(keyword));
            setFiltered(rest);
        } else setFiltered(droplets);
    };

    function handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
        // Before complete is called with the items they will remain in the
        // order before the drag
        // console.log('Before complete', droplets);

        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended. Update the items variable to the
        // new order of items
        setDroplets(event.detail.complete(droplets));

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
                    <IonTitle>{bucket?.title || 'Loading...'}</IonTitle>
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
                        <IonButton onClick={() => history.push(`/new_droplet?cid=${cid}&bid=${bid}&length=${droplets.length}`)}>
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <Resizer onChange={breakPointTrigger} />
            <IonContent fullscreen>
                <IonRefresher slot="fixed" disabled={swaping} onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        pullingIcon={chevronDownCircleOutline}
                        pullingText="Pull to refresh"
                        refreshingSpinner="circles"
                        refreshingText="Refreshing...">
                    </IonRefresherContent>
                </IonRefresher>
                <IonItem button>
                    <IonInput placeholder='Search Droplets' className='font-bold' onIonChange={onFilterHandler} />
                    {droplets?.length} &nbsp; <IonIcon icon={waterOutline} />
                </IonItem>
                <IonItemDivider></IonItemDivider>
                <IonList>
                    <IonReorderGroup disabled={!swaping} onIonItemReorder={handleReorder} className='space-y-5'>
                        {_.map(filtered, (e: IDropletSchema, i) => (
                            <IonItem key={e?.id} lines='none' className='ion-no-padding'>
                                <IonCard className='ion-activatable ion-no-margin w-full'>
                                    <IonRippleEffect></IonRippleEffect>
                                    <IonCardHeader>
                                        <IonCardSubtitle>{e?.title}</IonCardSubtitle>
                                        <IonCardSubtitle color={'primary'}>{e?.note}</IonCardSubtitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <InputBoxComponent text={e?.body} readonly copybtn id={i + ""} />
                                        <IonButtons>
                                            <IonButton color="secondary" fill='clear' onClick={() => history.push(`/edit_droplet?cid=${cid}&bid=${bid}&did=${e?.id}`)}>Edit</IonButton>
                                            <IonButton color="danger" fill='clear' onClick={() => deleteDroplet(e?.id || '')}>Delete</IonButton>
                                        </IonButtons>
                                    </IonCardContent>
                                </IonCard>
                                <IonReorder slot="end"></IonReorder>
                            </IonItem>
                        ))}
                    </IonReorderGroup>
                </IonList>
            </IonContent>
        </IonPage>
    )
}

export default Droplets;