## HealthBuddy-QA frontend deploy

### .env.local
```
gcloud run services list --platform managed \
--format="table[no-heading](URL)" --filter="metadata.name:healthbuddy-qa-backend-service" 

https://healthbuddy-qa-backend-service.*****.run.app

HEALTHBUDDY_QA_API="https://healthbuddy-qa-backend-service.*****.run.app/api/question"
HEALTHBUDDY_TRANSLATION_API="https://healthbuddy-qa-backend-service.*****.run.app/api/translation"
```

### .firebase.js
```
vi ~/src/.firebase.js

firebaseでアプリ作成後に、firebaseConfig変数をexportして保存する。
firebase storageのdomainが appspot.com -> firebaseapp.com に変わっている

export const firebaseConfig = {
  apiKey: "AI...",
  authDomain: "PROJECT.firebaseapp.com",
  projectId: "PROJECT-ID",
  storageBucket: "PROJECT-ID.firebasestorage.app",
  messagingSenderId: "12345",
  appId: "1:12345:web:2d....",
  measurementId: "G-....."
};

```

### container build
```
REPO=asia-northeast1-docker.pkg.dev/ai-hackathon-app-433705/container-image-repo

gcloud builds submit . --tag $REPO/healthbuddy-qa-frontend-service
```

### service account
```
gcloud iam service-accounts create llm-app-frontend
export SERVICE_ACCOUNT=llm-app-frontend@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role "roles/firebase.sdkAdminServiceAgent"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role "roles/run.invoker"
```

### service deploy
```
gcloud run deploy healthbuddy-qa-frontend-service \
--image $REPO/healthbuddy-qa-frontend-service \
--service-account $SERVICE_ACCOUNT \
--region asia-northeast1 --allow-unauthenticated


Deploying container to Cloud Run service [healthbuddy-qa-frontend-service] in project [ai-hackathon-app-433705] region [asia-northeast1]
✓ Deploying new service... Done.                                                                                                                                                         
  ✓ Creating Revision...                                                                                                                                                                 
  ✓ Routing traffic...                                                                                                                                                                   
  ✓ Setting IAM Policy...                                                                                                                                                                
Done.                                                                                                                                                                                    
Service [healthbuddy-qa-frontend-service] revision [healthbuddy-qa-frontend-service-00001-dck] has been deployed and is serving 100 percent of traffic.
Service URL: https://healthbuddy-qa-frontend-service-658068769407.asia-northeast1.run.app

```

### フロントエンドのクライアントコンポネントからCloud Storageにアクセスするためのセキュリティ設定
```
1. Cloud Storageに対して、外部ドメインからのアクセスを許可する設定(cors.json)

gsutil cors cors.json gs://$GOOGLE_CLOUD_PROJECT.appspot.com

2. Firebaseの認証機能で許可されたユーザだけがアクセスできる設定 (storage.rules)
Firebaseのコンソール (Storage) に storage.rules を適用する

フォルダ/[User ID]以下のサブフォルダを含む任意のファイルについて
該当のユーザIDでログイン認証済みのクライアントからの読み書きを許可する

```

### package.json lib/verifyIdToken.js
```
package.json
heartbeats undefined エラー対処
"filrebase": "^10.13.1"
https://github.com/firebase/firebase-js-sdk/issues/8436

lib/verifyIdToken.js
firebaseがhackathon用プロジェクトと結びついていない事に気づくのに時間がかかったのでエラーログを出している

エラー発生場所と内容
発生箇所: サーバコンポネントにfetchしたところ
内容: Unhandled Runtime Error、 SyntaxError: Unexpected end of JSON input

以下のエラーログで気づいた

 Error verifying ID token: FirebaseAuthError: Firebase ID token has incorrect "aud" (audience) claim. Expected "ai-hackathon-app-433705" but got "ai-hackathon-app-ade28". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.
     at FirebaseTokenVerifier.verifyContent (/home/gongqi_zhen_gcj_aihackathon/HealthBuddy-QA/TestApp/src/node_modules/firebase-admin/lib/auth/token-verifier.js:245:19)

```
