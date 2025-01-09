
## HealthBuddy-QA backend deploy

### container build
```
REPO=asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/container-image-repo
gcloud builds submit . --tag $REPO/healthbuddy-qa-backend-service
```

### service account
```
gcloud iam service-accounts create llm-app-backend
export SERVICE_ACCOUNT=llm-app-backend@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role "roles/aiplatform.user"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role "roles/storage.objectUser"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role "roles/cloudsql.client"
```

### service deploy
```
gcloud run deploy healthbuddy-qa-backend-service \
--image $REPO/healthbuddy-qa-backend-service \
--service-account $SERVICE_ACCOUNT \
--region asia-northeast1 --no-allow-unauthenticated \
--cpu 1 --memory 512Mi --concurrency 8
```

### check
```
SERVICE_URL=$(gcloud run services list --platform managed --format="table[no-heading](URL)" --filter="metadata.name:healthbuddy-qa-backend-service")
AUTH_HEADER="Authorization: Bearer $(gcloud auth print-identity-token)"
DATA='{"uid":"dummy_uid", "question":"血圧値は何を判断する値なのでしょうか。注意するべき値はどのようなもの ですか？"}'
```

事前に、 HealthBuddyQA.ipynb Notebookでuid:"dummy_uid"でpdfファイルをembeddingしておく

```
curl -X POST \
-H "$AUTH_HEADER" \
-H "Content-Type: application/json" \
-d "$DATA" \
-s $SERVICE_URL/api/question | jq .

-- result

{
  "answer": "血圧値は心臓のポンプが正常に働いているか、また高血圧かを判断する値です。  収縮期血圧が130～159mmHg、拡張期血圧が85～99mmHgの場合、要注意です。  これらの値は将来、脳・心血管疾患発症しうる可能性を考慮した基準範囲です。 \n",
  "source": [
    {
      "filename": "shoken-mikata.pdf",
      "page": 1
    },
    {
      "filename": "shoken-mikata.pdf",
      "page": 2
    },
    {
      "filename": "shoken-mikata.pdf",
      "page": 5
    },
    {
      "filename": "shoken-mikata.pdf",
      "page": 6
    },
    {
      "filename": "shoken-mikata.pdf",
      "page": 7
    }
  ]
}
```

## Eventarcのトリガーを設定する
```
gcloud services enable eventarc.googleapis.com
P142(Eventarc)の設定
KMS_SERVICE_ACCOUNT=$(gsutil kms serviceaccount -p $GOOGLE_CLOUD_PROJECT)
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$KMS_SERVICE_ACCOUNT \
--role roles/pubsub.publisher

gcloud iam service-accounts create eventarc-trigger
SERVICE_ACCOUNT=eventarc-trigger@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role roles/eventarc.eventReceiver

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
--member serviceAccount:$SERVICE_ACCOUNT \
--role roles/run.invoker
```

### ファイル作成・更新 (type=google.cloud.storage.object.v1.finalized)
```
export SERVICE_ACCOUNT=eventarc-trigger@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com
gcloud eventarc triggers create trigger-finalized-healthbuddy-qa-backend-service \
--destination-run-service healthbuddy-qa-backend-service \
--destination-run-region asia-northeast1 \
--location asia-northeast1 \
--event-filters "type=google.cloud.storage.object.v1.finalized" \
--event-filters "bucket=$GOOGLE_CLOUD_PROJECT.appspot.com" \
--service-account $SERVICE_ACCOUNT \
--destination-run-path /api/post


Creating trigger [trigger-finalized-healthbuddy-qa-backend-service] in project [ai-hackathon-app-433705], location [asia-northeast1]...done.                                            
WARNING: It may take up to 2 minutes for the new trigger to become active.
```

### ファイル削除 (type=google.cloud.storage.object.v1.deleted)
```
gcloud eventarc triggers create trigger-deleted-healthbuddy-qa-backend-service \
--destination-run-service healthbuddy-qa-backend-service \
--destination-run-region asia-northeast1 \
--location asia-northeast1 \
--event-filters "type=google.cloud.storage.object.v1.deleted" \
--event-filters "bucket=$GOOGLE_CLOUD_PROJECT.appspot.com" \
--service-account $SERVICE_ACCOUNT \
--destination-run-path /api/post
```

### [Project ID].appspot.comに新しいファイルを保存する、もしくは、既存のファイルを更新した際のイベント(finalized)について、イベント処理のタイムアウト秒を300秒に変更する。

### アップロードしたPDFファイルのページ数が多い場合、データベースへの登録に時間がかかる可能性があるため
```
TRIGGER=trigger-finalized-healthbuddy-qa-backend-service
SUBSCRIPTION=$(gcloud pubsub subscriptions list --format json | jq -r '.[].name' | grep $TRIGGER)
gcloud pubsub subscriptions update $SUBSCRIPTION --ack-deadline=300
```

## databases
```
gcloud sql instances create genai-app-db --database-version POSTGRES_15 \
--region asia-northeast1 --cpu 1 --memory 4GB --root-password genai-db-root

gcloud sql databases create docs_db --instance genai-app-db

gcloud sql users create db-admin --instance genai-app-db --password genai-db-admin

gcloud sql connect genai-app-db \
--user db-admin --database docs_db

Allowlisting your IP for incoming connection for 5 minutes...⠶                                                       
Allowlisting your IP for incoming connection for 5 minutes...done.                                                   
Connecting to database with SQL user [db-admin].Password: 
psql (15.8 (Debian 15.8-0+deb12u1), server 15.7)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

docs_db=> CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION

CREATE TABLE docs_embeddings(
 docid VARCHAR(1024) NOT NULL,
 uid VARCHAR(128) NOT NULL,
 filename VARCHAR(256) NOT NULL,
 page INTEGER NOT NULL,
 content TEXT NOT NULL,
 embedding vector(768) NOT NULL);
```
