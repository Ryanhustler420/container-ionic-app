##### How to make this project your own

```
Please close this and remove the remote using `git remote rm origin` and add your own remote `link`
Please change the `defaultFirebaseConfig` object in the `firebase.ts` file
Please change all the `appname` to `yourappname` in the entire project
Please generate the `android` or `ios` or npm build once your changed the `appname` to `yourappname`
Please change `app icon` to your desire `app icon` and `splash` if you want
Please make sure when you release the `android` app you need to keep the .rsa signature `safe` to somewhere
Please change the .bat file according to your need if you want to publish your ./build to `surge.sh` site
Please make sure when you release your build you need to update the version in `config.ts` file **[RECOMMANDED]**

```

# How to clone

##### Forked

>   https://github.com/Ryanhustler420/IonicReactTailwind.git

```
git clone https://github.com/Ryanhustler420/IonicReactTailwind.git
cd IonicReactTailwind
git remote rm origin
npm i
npm run dev
```

- ```npm i -g ionic --save```
- ```ionic start```

```cmd
Use the app creation wizard? No
Framework: React
Project name: appname
Starter template: blank
Create free Ionic account? No
```

```cmd
npm uninstall -g ionic
npm uninstall -g @ionic/cli
npm install -g @ionic/cli
```

```cmd 
ionic integrations enable capacitor
```
```cmd
ionic capacitor add android @REM if not worked
ionic capacitor add ios @REM if not worked
OR
npm install @capacitor/cli @capacitor/cli @capacitor/android @capacitor/ios
OR
npm install @capacitor/android
npm install @capacitor/ios
```
```cmd
ionic capacitor copy android @REM recommanded
```
```cmd
ionic capacitor copy android -l @REM live_reloading
```
```cmd
ionic capacitor sync android @REM recommanded
```
```cmd
npx cap open android @REM optional
```
```cmd
npm run dev
```

NOTE:

- Close the terminal/editor if not syncing android command not working, and then redo the process.

- Close android studio if new capacitor added library not visible on the project

```cmd
npm install @capacitor/{api}
npx cap sync
npx cap update
```

##### 3rd Party Packages

> [Splash screen generator](https://hotpot.ai/templates/splash-screen)

> [Ape Tools](https://apetools.webprofusion.com/#/)

> [Splash screen generator](https://dalezak.medium.com/generate-app-icon-and-splash-screen-images-for-ionic-framework-using-capacitor-e1f8c6ef0fd4)

> [Android resources helper](https://dalezak.medium.com/generate-app-icon-and-splash-screen-images-for-ionic-framework-using-capacitor-e1f8c6ef0fd4)

> [Integration Tailwind](https://larainfo.com/blogs/how-to-install-tailwind-css-with-npm)

> [Bootstrap](https://getbootstrap.com/docs/4.4/getting-started/introduction/)

> [Android Development](https://ionicframework.com/docs/developing/android)

> [React Redux](https://react-redux.js.org/tutorials/quick-start)

[Issues]

> [Bootstrap Css](https://stackoverflow.com/questions/38684023/bootstrap-4-flex-grid-system-only)

> [Capacitor Error](https://stackoverflow.com/questions/67633486/an-error-occurred-while-running-subprocess-capacitor-when-creating-new-ionic-pro)

> [Gradle Not Exist](https://stackoverflow.com/questions/63267827/capacitor-settings-gradle-as-it-does-not-exist)

# Build

> Delete the already created `android` folder

> Use android studio `image assets` to create app icon

> Change all the keyword `appname` to `yourappname` in the source code

> Rebuild the android sync using `ionic capacitor sync android` command

> Overwrite the `build/assets/icon` icons with your icons and let the name as it is

> Change the `icons` path in `build/assets/manifest.json`

> use `apetools` to create splash screen and overwrite the existing splash screen with yours.

> Always run `npm run dev` and then `ionic capacitor sync android` and then `npx cap open android`

> Build the process and update version

# Android Release

>   keep the `.rsa` safe for that app to release

-   Update the app `version`

-   Mark `live` to `true`

-   Test the app

-   Build the app

-   Update the android app `version`

-   Build the android app

-   Test the android app

-   Generate the apk

-   Store the apk to release `apks` folder

-   To `release` android apk, please update the app version and please 
