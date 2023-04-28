import Capacitor from "../utils/Capacitor";
import { Resizer } from '../components/Resizer';
import React, { useEffect, useState } from 'react';
import { FirebaseConfigValidator, IFirebaseConfigSchema } from '../utils/schemas/index';
import { PREFERENCE_KEYS, getPreference, removePreference, setPreference } from "../utils/common/cache";
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

import './Firebase.css';

const screen = { width: 0, name: 'sm' };
const Firebase: React.FC<{
    onShowTabs: () => void;
    onHideTabs: () => void;
    rendering: boolean;
}> = props => {
    useEffect(() => { if (props.rendering) { props.onShowTabs(); } });
    const [loading, setLoading] = useState<boolean>(false);

    const appIdRef = React.createRef<HTMLIonInputElement>();
    const apiKeyRef = React.createRef<HTMLIonInputElement>();
    const projectIdRef = React.createRef<HTMLIonInputElement>();
    const authDomainRef = React.createRef<HTMLIonInputElement>();
    const storageBucketRef = React.createRef<HTMLIonInputElement>();
    const measurementIdRef = React.createRef<HTMLIonInputElement>();
    const messagingSenderIdRef = React.createRef<HTMLIonInputElement>();

    const breakPointTrigger = (width: number | undefined, name: string | undefined) => {
        screen.width = width as number;
        screen.name = name as string;
    };

    useEffect(() => {
        setLoading(true);
        getPreference(PREFERENCE_KEYS.FIREBASE_CONFIG).then(cached => {
            if (cached.value) {
                const o = JSON.parse(cached.value);
                appIdRef.current?.setAttribute('value', o.appId);
                apiKeyRef.current?.setAttribute('value', o.apiKey);
                projectIdRef.current?.setAttribute('value', o.projectId);
                authDomainRef.current?.setAttribute('value', o.authDomain);
                storageBucketRef.current?.setAttribute('value', o.storageBucket);
                measurementIdRef.current?.setAttribute('value', o.measurementId);
                messagingSenderIdRef.current?.setAttribute('value', o.messagingSenderId);
            }
            setLoading(false);
        });
    }, []);

    const resetFirebaseConfig = () => removePreference(PREFERENCE_KEYS.FIREBASE_CONFIG).then(() => Capacitor.toast('Config set to default'));
    const onSubmitHandler = () => {
        setLoading(true);
        const data: IFirebaseConfigSchema = {
            appId: appIdRef.current?.value?.toString() || '',
            apiKey: apiKeyRef.current?.value?.toString() || '',
            projectId: projectIdRef.current?.value?.toString() || '',
            authDomain: authDomainRef.current?.value?.toString() || '',
            storageBucket: storageBucketRef.current?.value?.toString() || '',
            measurementId: measurementIdRef.current?.value?.toString() || '',
            messagingSenderId: messagingSenderIdRef.current?.value?.toString() || '',
        };
        const result = FirebaseConfigValidator.validate(data);
        if (result.error != null) Capacitor.toast(result.error?.message);
        else setPreference(PREFERENCE_KEYS.FIREBASE_CONFIG, JSON.stringify(data)).then(() => {
            Capacitor.toast('Saved the changes');
        });
        setLoading(false);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Firebase</IonTitle>
                    <IonButtons slot='end' hidden={!loading}>
                        <IonSpinner />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <Resizer onChange={breakPointTrigger} />
            <IonContent fullscreen>
                <div className='ion-padding'>
                    <h1 className="text-4xl font-bold">Firebase Config</h1>
                </div>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked"><strong>API Key</strong></IonLabel>
                        <IonInput ref={apiKeyRef} clearOnEdit={true} placeholder="AIzaS*****_jPc3Y" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Auth Domain</strong></IonLabel>
                        <IonInput ref={authDomainRef} clearOnEdit={true} placeholder="xxx.firebaseapp.com" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Project Id</strong></IonLabel>
                        <IonInput ref={projectIdRef} clearOnEdit={true} placeholder="xxx" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Storage Bucket</strong></IonLabel>
                        <IonInput ref={storageBucketRef} clearOnEdit={true} placeholder="xxx.appspot.com" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Messaging Sender Id</strong></IonLabel>
                        <IonInput ref={messagingSenderIdRef} clearOnEdit={true} placeholder="9011349XXXXX" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>App Id</strong></IonLabel>
                        <IonInput ref={appIdRef} clearOnEdit={true} placeholder="1:9011349XXXXX:web:xxx" />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><strong>Measurement Id</strong></IonLabel>
                        <IonInput ref={measurementIdRef} clearOnEdit={true} placeholder="G-K8ZK4XQXXX" />
                    </IonItem>
                </IonList>
            </IonContent>
            <IonToolbar>
                <IonButtons slot='start'>
                    <IonButton onClick={resetFirebaseConfig}>Load Detault</IonButton>
                </IonButtons>
                <IonButtons slot='end'>
                    <IonSpinner hidden />
                    <IonButton onClick={onSubmitHandler}>Save</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    )
}

export default Firebase;
