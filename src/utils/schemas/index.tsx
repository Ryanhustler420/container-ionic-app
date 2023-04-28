import Joi from 'joi';

export interface IContainerSchema { id?: string; title: string; subtitle: string; };
const ContainerSchema = {
    title: Joi.string().required().min(5),
    subtitle: Joi.string().required().min(5),
};
export const ContainerValidator = Joi.object().keys(ContainerSchema);

export interface IBucketSchema { id?: string; title: string; subtitle: string; };
const BucketSchema = {
    title: Joi.string().required().min(5),
    subtitle: Joi.string().required().min(5),
};
export const BucketValidator = Joi.object().keys(BucketSchema);

export interface IDropletSchema { id?: string; index?: number; title: string; body: string; note: string; };
const DropletSchema = {
    index: Joi.number().optional(),
    title: Joi.string().required().min(5),
    body: Joi.string().required().min(5),
    note: Joi.string().required().min(5),
};
export const DropletValidator = Joi.object().keys(DropletSchema);

export interface IFirebaseConfigSchema { appId: string; apiKey: string; projectId: string; authDomain: string; storageBucket: string; measurementId: string; messagingSenderId: string; };
const FirebaseConfigSchema = {
    appId: Joi.string().required().min(5),
    apiKey: Joi.string().required().min(5),
    projectId: Joi.string().required().min(5),
    authDomain: Joi.string().required().min(5),
    storageBucket: Joi.string().required().min(5),
    measurementId: Joi.string().required().min(5),
    messagingSenderId: Joi.string().required().min(5),
};
export const FirebaseConfigValidator = Joi.object().keys(FirebaseConfigSchema);