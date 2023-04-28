import _ from 'lodash';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { IBucketSchema, IContainerSchema } from '../utils/schemas';
import { addOutline, chevronDownCircleOutline, logoBitbucket } from 'ionicons/icons';
import { InputChangeEventDetail, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText, IonTitle, IonToolbar, RefresherEventDetail } from '@ionic/react';

import { getDocs, getDoc, doc, deleteDoc, collection } from "firebase/firestore";
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
                const set = buckets as IBucketSchema[];
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
                        <IonButton onClick={() => history.push(`/new_bucket?cid=${cid}`)}>
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
                <IonItemDivider></IonItemDivider>
                <IonList className="ion-no-padding">
                    {_.map(filtered, (e: IBucketSchema, i) => (
                        <IonItemSliding key={i} ref={e => e?.closeOpened()}>
                            <IonItemOptions side="end">
                                <IonItemOption color="dark" onClick={() => { deleteBucket(e?.id || '') }}>Delete</IonItemOption>
                                <IonItemOption color="dark" onClick={() => history.push(`/edit_bucket?cid=${cid}&bid=${e?.id}`)}>Edit</IonItemOption>
                            </IonItemOptions>
                            <IonItem button onClick={() => history.push(`/droplets?cid=${cid}&bid=${e?.id}`)}>
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
    )
}

export default Buckets;