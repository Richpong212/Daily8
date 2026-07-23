## DEPLOYING Web Application using k8s on home server

### Requirement, ensure k8s is deployed onto the web cluster and has all the required components

- Argocd
- github credential to pull private image from grc

### Design of application platform -##

k8s/
├── apps/
│ ├── daily8-backend/
│ │ └── base/
│ └── daily8-frontend/
│ └── base/
│
├── data/
│ ├── postgres/
│ │ └── daily8/
│ └── redis/
│ └── daily8/
│
├── overlays/
│ ├── daily8-dev/
│ ├── daily8-staging/
│ └── daily8-prod/
│
└── platform/
└── argocd/
└── applications/
└── daily8-dev.yml

### Step 1: Setup argocd in the application to ensure we manage it in the cluster.

Here is the structure:
Daily8/
└── k8s/
├── argocd/
│ ├── daily8.yml
│ └── kustomization.yml
├── base/
│ └── kustomization.yml
└── overlays/
└── dev/
└── kustomization.yml

run this command
mkdir -p k8s/argocd
mkdir -p k8s/base
mkdir -p k8s/overlays/dev

- next we create the file for daily 8 to define the argocd app for this project
  `k8s/argocd/daily8.yml`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: daily8-dev
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  source:
    repoURL: https://github.com/Richpong212/Daily8.git
    targetRevision: main
    path: k8s/overlays/dev

  destination:
    server: https://kubernetes.default.svc
    namespace: daily8-dev

  syncPolicy:
    automated:
      prune: true
      selfHeal: true

    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
```

### step 2 -##

we create the kuztomization file for ArgoCD

- create
  k8s/argocd/kustomization.yml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - daily8.yml
```

## step 3

- Next we create the base kuztomization file which is going to be empty as we will add resources as the project grows
  `k8s/base/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources: []
```

## step 4 -##

- we will now go ahead and create the development overlay, because we will have one for staging and prod as well.
  `k8s/overlays/dev/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: daily8-dev

resources:
  - ../../base

commonLabels:
  app.kubernetes.io/name: daily8
  app.kubernetes.io/part-of: daily8
  app.kubernetes.io/environment: dev
  app.kubernetes.io/managed-by: argocd
```

## NOW, lets create the github repo and then push our code to the main branch...

- onece down we also create a new branch called `dev`
- git checkout -b dev
- git add .
- git commit -m dev-initiated
- git push -u origin dev

this will push the code to the dev and then we can move on to the next phase

- Ensure you have github permission to get the code onto the server
- now on the server clone the repo onto the server

## Check if everything worked by running the kuztomize command: also ensure you have kuztomize on your web server to manage k8s resources

- `kubectl kustomize k8s/argocd`

We should see nothing if everything works fine..

### Apply the argocd manually for the first time to ensure that we have to watch our applications

- `kubectl apply -k k8s/argocd`

Now we should see the results

```yaml
aily8$ kubectl apply -k k8s/argocd Warning: metadata.finalizers: "resources-finalizer.argocd.argoproj.io": prefer a domain-qualified finalizer name including a path (/) to avoid accidental conflicts with other finalizer writers application.argoproj.io/daily8-dev created
```

normal warming nothing to really worry about.

### PS: also ensure you already have argocd working in your cluster and authenticated with github

### now check if the argocd app is ready

`k get application daily8-dev -n argocd`

### Creating the Database for backend application

- Ensure you have CloudNativePG already installed in your cluster and configured. This is going to help us managed our database.

#### we will now create the secrets for the database credentials.

- create the postgres folder
  `mkdir -p k8s/base/postgres`

- Next we will create the file to define our password
  `k8s/base/postgres/owner-secret.yml`
  `yaml`

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
  name: daily8-dev-db-owner
  labels:
    cnpg.io/reload: "true"
  type: kubernetes.io/basic-auth
  stringData:
  username: daily8_user
  password: CHANGE_ME_TO_A_STRONG_PASSWORD
  ```

  so now you can change the password and the username to a name of your choice.
  To get a strong password, you can generate password using this command
  `openssl rand -base64 32`
  - Create the CloudNativePG cluster for the database
    `k8s/base/postgres/cluster.yml`

  ```yaml
  apiVersion: postgresql.cnpg.io/v1
  kind: Cluster
  metadata:
  name: daily8-postgres
  spec:
  instances: 1

  imageName: ghcr.io/cloudnative-pg/postgresql:16

  bootstrap:
    initdb:
      database: daily8_dev
      owner: daily8_user
      secret:
        name: daily8-dev-db-owner

  storage:
    size: 5Gi
    storageClass: local-path
  ```

- create the kuztomization file for the postgreSQL
  `k8s/base/postgres/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - owner-secret.yml
  - cluster.yml
```

- So no in the base folder we are going to first add our first kuztomize resources.
  so now the kustomization.yml becomes like this

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - postgres
```

now this will create our application for the database when we push to gihub and argocd takes charge
Push the code to github and lets argocd take charge and deploy the database to be used by the backend

once the code is pushed to github, lets verify our db is been deployed

- `k get cluster daily8-postgres -n daily8-dev -w` - we check the cluster for the postgres that we are creating and we watch it until the cluster is ready

if everything goes well up to this time, then we should have this results:

```yaml
kwakurichie@k8s-master:~/Documents/Daily8$ k get cluster daily8-postgres -n daily8-dev -w
NAME              AGE   INSTANCES   READY   STATUS               PRIMARY
daily8-postgres   82s   1                   Setting up primary
daily8-postgres   83s   1                   Setting up primary
daily8-postgres   86s   1                   Waiting for the instances to become active
daily8-postgres   89s   1                   Waiting for the instances to become active   daily8-postgres-1
daily8-postgres   90s   1                   Waiting for the instances to become active   daily8-postgres-1
daily8-postgres   106s   1           1       Waiting for the instances to become active   daily8-postgres-1
daily8-postgres   107s   1           1       Waiting for the instances to become active   daily8-postgres-1
daily8-postgres   112s   1           1       Cluster in healthy state                     daily8-postgres-1
daily8-postgres   2m11s   1           1       Cluster in healthy state                     daily8-postgres-1
```

### Redis setup -##

The next phase is to setup redis for caching in our application

- create folder to host the redis yaml
  `mkdir -p k8s/base/redis`

- create the secrets for the redis auth
  `k8s/base/redis/secret.yml`

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
  name: daily8-redis-auth
  type: Opaque
  stringData:
  password: CHANGE_ME_TO_A_STRONG_REDIS_PASSWORD
  ```

- create the deployment base file for redis
  `touch k8s/base/redis/deployment.yml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: daily8-redis
spec:
  replicas: 1

  selector:
    matchLabels:
      app.kubernetes.io/component: redis

  template:
    metadata:
      labels:
        app.kubernetes.io/component: redis

    spec:
      containers:
        - name: redis
          image: redis:7.4-alpine
          imagePullPolicy: IfNotPresent

          command:
            - redis-server

          args:
            - --appendonly
            - "yes"
            - --requirepass
            - "$(REDIS_PASSWORD)"

          env:
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: daily8-redis-auth
                  key: password

          ports:
            - name: redis
              containerPort: 6379
              protocol: TCP

          readinessProbe:
            exec:
              command:
                - sh
                - -c
                - redis-cli -a "$REDIS_PASSWORD" ping
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3

          livenessProbe:
            exec:
              command:
                - sh
                - -c
                - redis-cli -a "$REDIS_PASSWORD" ping
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 3
            failureThreshold: 3

          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 250m
              memory: 256Mi

          volumeMounts:
            - name: redis-data
              mountPath: /data

      volumes:
        - name: redis-data
          persistentVolumeClaim:
            claimName: daily8-redis-data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: daily8-redis-data
spec:
  accessModes:
    - ReadWriteOnce

  storageClassName: local-path

  resources:
    requests:
      storage: 1Gi
```

- create the redis service for the redis deployment
  `k8s/base/redis/service.yml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: daily8-redis
spec:
  type: ClusterIP

  selector:
    app.kubernetes.io/component: redis

  ports:
    - name: redis
      port: 6379
      targetPort: redis
      protocol: TCP
```

so now we will have the data for the redis connection for our backend

```yaml
REDIS_HOST=daily8-redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_TO_A_STRONG_REDIS_PASSWORD
```

- create the kustomization file for the redis
- `k8s/base/redis/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - secret.yml
  - deployment.yml
  - service.yml
```

Now we will update the base with the redis kuztomization
Update
`k8s/base/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - postgres
  - redis
```

- Network Policies
  Now we are going to creat the network policies for the applications.
  `mkdir -p k8s/base/network-policies`

- Lets deny all network traffic
  `k8s/base/network-policies/default-deny-ingress.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: daily8-default-deny-ingress
spec:
  podSelector: {}

  policyTypes:
    - Ingress
```

- Allow communication between backend and postgresDB
- `k8s/base/network-policies/allow-backend-to-postgres.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-daily8-backend-to-postgres
spec:
  podSelector:
    matchLabels:
      cnpg.io/cluster: daily8-postgres

  policyTypes:
    - Ingress

  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: daily8
              app.kubernetes.io/component: daily8-backend

      ports:
        - protocol: TCP
          port: 5432
```

- Allow communication between backend and redis
- `k8s/base/network-policies/allow-daily8-backend-to-redis.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-daily8-backend-to-redis
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: daily8
      app.kubernetes.io/component: daily8-redis

  policyTypes:
    - Ingress

  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: daily8
              app.kubernetes.io/component: daily8-backend

      ports:
        - protocol: TCP
          port: 6379
```

- Now we create the kuztomization file for the network policy
  `k8s/base/network-policies/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - default-deny-ingress.yml
  - allow-daily8-backend-to-postgres.yml
  - allow-daily8-backend-to-redis.yml
```

- Now update the `k8s/base/kustomization.yml` file with the new network policy

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - postgres
  - redis
  - network-policies
```

### Backend Setup -##

- We will now setup the deployment files for the backend.

- create the files to host the backend yaml code

```yaml
mkdir -p k8s/base/backend

touch k8s/base/backend/service-account.yml
touch k8s/base/backend/configmap.yml
touch k8s/base/backend/secret.yml
touch k8s/base/backend/deployment.yml
touch k8s/base/backend/service.yml
touch k8s/base/backend/kustomization.yml
touch k8s/base/backend/ingress.yml
```

- ### Configure github container registry secret -##
- We are going to ctreat PAT - personal access token for the repo
- Go to GitHub → Settings → Developer settings → Personal access tokens → classic tokens.
- Click Generate new token.
- Configure:

* Token name: daily8-ghcr-pull
* Expiration: 90 days (or your preferred rotation period) \
* select - read:packages

- Now go onto the master node and configure the secrets

```yaml
kubectl create secret docker-registry daily8-image-pull-secret \
--namespace daily8-dev \
--docker-server=ghcr.io \
--docker-username=Richpong212 \
--docker-password='<YOUR_CLASSIC_PAT>' \
--docker-email='<YOUR_GITHUB_EMAIL>'
```

- Lets begin to make the service account. It does not need api access so we must turn the automatic service-account token mounting. off
  `k8s/base/backend/service-account.yml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: daily8-backend-service-account
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend
automountServiceAccountToken: false
```

- Create the config map to hold environment variables the application depends on
  `k8s/base/backend/configmap.yml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: daily8-backend-config
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend
data:
  NODE_ENV: development

  APP_PORT: "5010"
  APP_HOST: "0.0.0.0"

  POSTGRES_HOST: daily8-postgres-rw
  POSTGRES_PORT: "5432"
  POSTGRES_DB: daily8_dev
  POSTGRES_USER: daily8_user

  REDIS_HOST: daily8-redis
  REDIS_PORT: "6379"

  CLIENT_URL: http://localhost:3004
  ALLOWED_ORIGINS: http://localhost:3004,http://localhost:3005

  REQUEST_BODY_LIMIT: 100kb

  AUTH_COOKIE_NAME: daily8_session
  AUTH_COOKIE_SAME_SITE: strict
  LOGIN_TOKEN_TTL: 3d
  AUTH_COOKIE_MAX_AGE_MS: "3600000"

  AUTH_RATE_LIMIT_WINDOW_MS: "900000"
  AUTH_RATE_LIMIT_MAX: "10"

  ADMIN_RATE_LIMIT_WINDOW_MS: "900000"
  ADMIN_RATE_LIMIT_MAX: "60"

  GLOBAL_RATE_LIMIT_WINDOW_MS: "900000"
  GLOBAL_RATE_LIMIT_MAX: "100"

  AWS_REGION: us-east-1
  AWS_S3_BUCKET: rentaa-property-images-dev
  AWS_S3_PROPERTY_IMAGE_PREFIX: property-images
  AWS_S3_PUBLIC_BASE_URL: https://rentaa-property-images-dev.s3.us-east-1.amazonaws.com
  AWS_PRESIGNED_UPLOAD_TTL_SECONDS: "300"

  PROPERTY_IMAGE_MAX_BYTES: "5242880"
  PROPERTY_IMAGE_ALLOWED_TYPES: image/jpeg,image/png,image/webp

  SMTP_HOST: smtp.gmail.com
  SMTP_PORT: "587"
  SMTP_EMAIL: youremail@gmail.com
  SMTP_FROM_NAME: Daily8
  SMTP_FROM_EMAIL: youremail@gmail.com
  SMTP_SECURE: "false"
  SMTP_REQUIRE_TLS: "true"
```

- Create backend secrets to hold database and secrets keys
  `k8s/base/backend/secret.yml`

- We will create the base deployment file for the backend.
  `k8s/base/backend/deployment.yml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: daily8-backend
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend
spec:
  replicas: 1

  selector:
    matchLabels:
      app.kubernetes.io/name: daily8
      app.kubernetes.io/component: daily8-backend

  template:
    metadata:
      labels:
        app.kubernetes.io/name: daily8
        app.kubernetes.io/component: daily8-backend

    spec:
      serviceAccountName: daily8-backend-service-account
      imagePullSecrets:
        - name: daily8-ghcr-secret
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault

      containers:
        - name: daily8-backend
          image: daily8-backend-image
          imagePullPolicy: IfNotPresent

          ports:
            - name: http
              containerPort: 5010
              protocol: TCP

          envFrom:
            - configMapRef:
                name: daily8-backend-config

            - secretRef:
                name: daily8-backend-secret

          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: daily8-dev-db-owner
                  key: password

            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: daily8-redis-auth
                  key: password

          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 6

          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 20
            timeoutSeconds: 3
            failureThreshold: 3

          resources:
            requests:
              cpu: 100m
              memory: 128Mi

            limits:
              cpu: 500m
              memory: 512Mi

          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
```

- We will make the service file for the banked so we can expose it internallly for the client side to connect to it.
  `k8s/base/backend/service.yml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: daily8-backend
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend
spec:
  type: ClusterIP

  selector:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend

  ports:
    - name: http
      port: 5010
      targetPort: http
      protocol: TCP
```

Now we will create the kuztomiation file for the backend

`k8s/base/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - postgres
  - redis
  - network-policies
  - backend
```

- Update the overlay section so that we can have the image been pulled from ghcr
  `k8s/overlays/dev/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: daily8-dev

resources:
  - ../../base

labels:
  - pairs:
      app.kubernetes.io/name: daily8
      app.kubernetes.io/environment: dev
      app.kubernetes.io/managed-by: argocd

images:
  - name: daily8-backend-image
    newName: ghcr.io/richpong212/daily8/backend
    newTag: REPLACE_WITH_COMMIT_SHA
```

- We will create the ingress file to handle traffic
- `k8s/base/backend/ingress.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: daily8-backend
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-backend
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-cloudflare
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

spec:
  ingressClassName: nginx

  tls:
    - hosts:
        - daily8-api.richpong.com
      secretName: daily8-api-richpong-com-tls

  rules:
    - host: daily8-api.richpong.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: daily8-backend
                port:
                  number: 5010
```

## Admin setup -##

Now we will create the platform deployment files for the admin client

- create the folders

```yaml
mkdir -p k8s/base/admin

touch k8s/base/admin/deployment.yml
touch k8s/base/admin/service.yml
touch k8s/base/admin/service-account.yml
touch k8s/base/admin/configmap.yml
touch k8s/base/admin/ingress.yml
touch k8s/base/admin/kustomization.yml
```

- configure the serviceaccount
  `k8s/base/admin/service-account.yml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: daily8-admin-service-account
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

automountServiceAccountToken: false

imagePullSecrets:
  - name: daily8-image-pull-secret
```

now we added the image pull secret to the serviceaccount so we do not need to specify it in the deployment file

- Now we create the admin configmap to hold the variables that the client side need
  `k8s/base/admin/configmap.yml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: daily8-admin-config
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

data:
  API_URL: https://daily8-api.richpong.com
```

- Deployment file for the Admin
  `k8s/base/admin/deployment.yml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: daily8-admin
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

spec:
  replicas: 1

  selector:
    matchLabels:
      app.kubernetes.io/name: daily8
      app.kubernetes.io/component: daily8-admin

  template:
    metadata:
      labels:
        app.kubernetes.io/name: daily8
        app.kubernetes.io/component: daily8-admin

    spec:
      serviceAccountName: daily8-admin-service-account

      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault

      containers:
        - name: daily8-admin
          image: daily8-admin-image
          imagePullPolicy: IfNotPresent

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP

          envFrom:
            - configMapRef:
                name: daily8-admin-config

          readinessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 6

          livenessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 20
            periodSeconds: 20
            timeoutSeconds: 3
            failureThreshold: 3

          resources:
            requests:
              cpu: 50m
              memory: 64Mi

            limits:
              cpu: 300m
              memory: 256Mi

          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
```

- lets make the Admin service to expose the application
  k8s/base/admin/service.yml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: daily8-admin
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

spec:
  type: ClusterIP

  selector:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

  ports:
    - name: http
      port: 8080
      targetPort: http
      protocol: TCP
```

- Now we create the ingress for the admin
  `k8s/base/admin/ingress.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: daily8-admin
  labels:
    app.kubernetes.io/name: daily8
    app.kubernetes.io/component: daily8-admin

  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-cloudflare
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

spec:
  ingressClassName: nginx

  tls:
    - hosts:
        - daily8-admin.richpong.com
      secretName: daily8-admin-richpong-com-tls

  rules:
    - host: daily8-admin.richpong.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: daily8-admin
                port:
                  number: 8080
```

- Now lets create the Admin kuztomization file
  `k8s/base/admin/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - service-account.yml
  - configmap.yml
  - deployment.yml
  - service.yml
  - ingress.yml
```

- Now update the base kuztomization file with the admin

`k8s/base/kustomization.yml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - postgres
  - redis
  - backend
  - admin
  - network-policies
```

- now update the GHCR admin image in the overlay dev kuztomization

```
images:
  - name: daily8-backend-image
    newName: ghcr.io/richpong212/daily8/backend
    newTag: BACKEND_COMMIT_SHA

  - name: daily8-admin-image
    newName: ghcr.io/richpong212/daily8/admin
    newTag: ADMIN_COMMIT_SHA
```

- Allow network access for the ingress for the admin
  `k8s/base/network-policies/allow-ingress-nginx-to-daily8-admin.yml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-nginx-to-daily8-admin

spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: daily8
      app.kubernetes.io/component: daily8-admin

  policyTypes:
    - Ingress

  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx

          podSelector:
            matchLabels:
              app.kubernetes.io/component: controller

      ports:
        - protocol: TCP
          port: 8080
```

- now update the network kuztomization file

```yaml
resources:
  - default-deny-ingress.yml
  - allow-daily8-backend-to-postgres.yml
  - allow-daily8-backend-to-redis.yml
  - allow-ingress-nginx-to-daily8-backend.yml
  - allow-ingress-nginx-to-daily8-admin.yml
```

## CICD deployment section -##

`.github/workflows/backend-ci-dev.yml`

```yaml
name: Daily8 Backend CI/CD

on:
  push:
    branches:
      - dev
    paths:
      - "backend/**"
      - ".github/workflows/backend-ci.yml"

  pull_request:
    branches:
      - dev
    paths:
      - "backend/**"
      - ".github/workflows/backend-ci.yml"

concurrency:
  group: daily8-backend-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write
  packages: write
  id-token: write

env:
  IMAGE_NAME: ghcr.io/richpong212/daily8/backend
  IMAGE_TAG: ${{ github.sha }}
  DOCKERFILE_PATH: ./backend/Dockerfile.backend
  BUILD_CONTEXT: ./backend
  KUSTOMIZATION_PATH: k8s/overlays/dev/kustomization.yml

jobs:
  check:
    name: Check backend
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: yarn
          cache-dependency-path: backend/yarn.lock

      - name: Enable Corepack
        run: corepack enable

      - name: Install backend dependencies
        working-directory: backend
        run: yarn install --immutable

      - name: Run backend checks
        working-directory: backend
        run: yarn check

  dependency-scan:
    name: Scan backend dependencies
    runs-on: ubuntu-latest
    needs:
      - check

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Scan backend filesystem
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: fs
          scan-ref: backend
          scanners: vuln,secret
          format: table
          severity: CRITICAL,HIGH
          exit-code: "1"
          ignore-unfixed: true

  image-scan:
    name: Build and scan backend image
    runs-on: ubuntu-latest
    needs:
      - dependency-scan

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image for scanning
        uses: docker/build-push-action@v6
        with:
          context: ${{ env.BUILD_CONTEXT }}
          file: ${{ env.DOCKERFILE_PATH }}
          push: false
          load: true
          platforms: linux/arm64
          no-cache: true
          provenance: false
          sbom: false
          tags: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}

      - name: Scan backend image
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          image-ref: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
          format: table
          severity: CRITICAL,HIGH
          exit-code: "1"
          ignore-unfixed: true

      - name: Generate backend SBOM
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          image-ref: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
          format: cyclonedx
          output: backend-sbom.cdx.json

      - name: Upload backend SBOM
        uses: actions/upload-artifact@v6
        with:
          name: daily8-backend-sbom-${{ env.IMAGE_TAG }}
          path: backend-sbom.cdx.json
          if-no-files-found: error
          retention-days: 30

  publish:
    name: Publish backend image
    runs-on: ubuntu-latest
    needs:
      - image-scan

    if: github.event_name == 'push'

    outputs:
      image-digest: ${{ steps.publish-image.outputs.digest }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend image
        id: publish-image
        uses: docker/build-push-action@v6
        with:
          context: ${{ env.BUILD_CONTEXT }}
          file: ${{ env.DOCKERFILE_PATH }}
          push: true
          platforms: linux/arm64
          no-cache: true
          provenance: false
          sbom: false
          tags: |
            ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
            ${{ env.IMAGE_NAME }}:dev

  sign:
    name: Sign backend image
    runs-on: ubuntu-latest
    needs:
      - publish

    if: github.event_name == 'push'

    steps:
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Install Cosign
        uses: sigstore/cosign-installer@v3

      - name: Sign backend image
        env:
          IMAGE_DIGEST: ${{ needs.publish.outputs.image-digest }}
        run: |
          cosign sign --yes \
            "${IMAGE_NAME}@${IMAGE_DIGEST}"

  update-dev:
    name: Update backend dev manifest
    runs-on: ubuntu-latest
    needs:
      - sign

    if: github.event_name == 'push'

    steps:
      - name: Checkout dev branch
        uses: actions/checkout@v6
        with:
          ref: dev
          fetch-depth: 0

      - name: Update backend Kustomize image tag
        env:
          NEW_IMAGE_TAG: ${{ env.IMAGE_TAG }}
        run: |
          python <<'PY'
          import os
          from pathlib import Path

          path = Path("k8s/overlays/dev/kustomization.yml")
          image_name = "daily8-backend-image"
          new_tag = os.environ["NEW_IMAGE_TAG"]

          lines = path.read_text().splitlines()
          updated = False
          inside_target_image = False

          for index, line in enumerate(lines):
              stripped = line.strip()

              if stripped.startswith("- name:"):
                  current_image = stripped.split(":", 1)[1].strip()
                  inside_target_image = current_image == image_name
                  continue

              if inside_target_image and stripped.startswith("newTag:"):
                  indentation = line[: len(line) - len(line.lstrip())]
                  lines[index] = f'{indentation}newTag: "{new_tag}"'
                  updated = True
                  break

          if not updated:
              raise SystemExit(
                  f"Could not find newTag for image '{image_name}' in {path}"
              )

          path.write_text("\n".join(lines) + "\n")
          PY

      - name: Validate updated tag
        run: |
          grep -A3 \
            "name: daily8-backend-image" \
            "${KUSTOMIZATION_PATH}"

      - name: Commit and push manifest update
        run: |
          git config user.name "Daily8 Platform Bot"
          git config user.email "platform-bot@daily8.io"

          git add "${KUSTOMIZATION_PATH}"

          if git diff --cached --quiet; then
            echo "No backend image tag change to commit"
            exit 0
          fi

          git commit \
            -m "chore: update Daily8 backend dev image to ${IMAGE_TAG}"

          git pull --rebase origin dev
          git push origin HEAD:dev
```

- cicd for the client
