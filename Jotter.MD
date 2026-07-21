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

##
