import { useHistory } from 'react-router';
import Capacitor from '../utils/Capacitor';
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { getQueryParam } from '../utils/common/helper';
import { BucketValidator, IBucketSchema } from '../utils/schemas';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import { addDoc, collection } from "firebase/firestore";
import firebase, { collections } from '../firebase';

import './NewBucket.css';

const screen = { width: 0, name: 'sm' };
const NewBucket: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    const history = useHistory();
    const [loading, setLoading] = useState<boolean>(false);
    const [cid,] = useState(getQueryParam()['cid']);
    const [length,] = useState(getQueryParam()['length']);

    const titleRef = React.createRef<HTMLIonInputElement>();
    const subtitleRef = React.createRef<HTMLIonInputElement>();

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    useEffect(() => { if (!getQueryParam()['cid'] || !getQueryParam()['length']) return history.goBack(); }, []);
    useEffect(() => { if (props.rendering) { props.onHideTabs(); } });

    const onSubmitHandler = () => {
        const data: IBucketSchema = {
            title: titleRef.current?.value?.toString() || '',
            subtitle: subtitleRef.current?.value?.toString() || '',
            index: Math.max(0, (+length)),
        };
        const result = BucketValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else {
            setLoading(true);
            firebase().then(async e => {
                await addDoc(collection(e.db, collections.CONTAINERS, cid, collections.BUCKETS), result.value);
                Capacitor.toast(`New bucket has created`);
                setLoading(false);
                history.goBack();
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>New Bucket</IonTitle>
                    <IonButtons slot="start">
                        <IonButton>
                            <IonBackButton defaultHref='/' />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <Resizer onChange={breakPointTrigger} />
            <IonContent fullscreen>
                <div className='ion-padding'>
                    <h1 className="text-4xl font-bold">Create</h1>
                </div>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Title</strong></IonLabel>
                        <IonInput ref={titleRef} clearOnEdit={true} placeholder="Design Job" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Subtitle</strong></IonLabel>
                        <IonInput ref={subtitleRef} clearOnEdit={true} placeholder="Create a simple mock design for load balancer" />
                    </IonItem>
                </IonList>
            </IonContent>
            <IonToolbar>
                <IonButtons slot='end'>
                    <IonSpinner hidden={!loading} />
                    <IonButton onClick={onSubmitHandler}>Ok, Create</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    )
}

export default NewBucket;