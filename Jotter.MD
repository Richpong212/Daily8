## DEPLOYING Web Application using k8s on home server

### Requirement, ensure k8s is deployed onto the web cluster and has all the required components

- Argocd
- github credential to pull private image from grc

### Design of application platform

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

### step 2

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

## step 4

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
