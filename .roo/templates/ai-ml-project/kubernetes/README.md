# Kubernetes Templates for AI/ML Project

This directory contains Kubernetes template files for deploying an AI/ML project. These templates provide a starting point for setting up the necessary infrastructure components.

## Important Security Notice

These templates are designed to be used as a foundation for creating actual Kubernetes manifests. They do not contain any real secrets, keys, or sensitive data. When deploying to a real environment, you should:

1. Replace placeholder values with actual values appropriate for your environment
2. Generate and manage secrets securely using tools like Sealed Secrets or HashiCorp Vault
3. Never commit actual secrets to version control

## Template Files

- `deployment.yaml` - Main application deployment
- `service.yaml` - Service definitions for internal and external access
- `ingress.yaml` - Ingress controller configuration
- `configmap.yaml` - Configuration data
- `secret.yaml` - Template for secret management
- `pvc.yaml` - Persistent volume claims for data storage
- `namespace.yaml` - Namespace definition
- `rbac.yaml` - Role-based access control definitions
- `hpa.yaml` - Horizontal pod autoscaler
- `networkpolicy.yaml` - Network policies for security
- `resourcequota.yaml` - Resource quotas for namespace limits
- `limitrange.yaml` - Default resource limits for containers
- `cronjob.yaml` - Scheduled jobs
- `job.yaml` - One-time jobs
- `daemonset.yaml` - Daemon sets for node-level services
- `statefulset.yaml` - Stateful applications
- `serviceaccount.yaml` - Service accounts for pods
- `clusterrole.yaml` - Cluster-wide roles
- `clusterrolebinding.yaml` - Cluster role bindings
- `storageclass.yaml` - Storage class definitions
- `pv.yaml` - Persistent volumes
- `pdb.yaml` - Pod disruption budgets
- `servicemonitor.yaml` - Service monitoring definitions
- `prometheusrule.yaml` - Prometheus alerting rules
- `alertmanagerconfig.yaml` - Alert manager configuration
- `certificate.yaml` - TLS certificate definitions
- `issuer.yaml` - Certificate issuer configuration
- `clusterissuer.yaml` - Cluster-wide certificate issuer
- `sealedsecret.yaml` - Sealed secrets template

## Usage

1. Review each template and customize the placeholder values
2. Apply the templates using `kubectl apply -f <filename.yaml>`
3. For secrets, use Sealed Secrets or another secure secret management solution
4. Test the deployment in a development environment before promoting to production

## Customization

Before deploying, you should customize the following values:

- Namespace names
- Service names
- Image names and tags
- Resource limits and requests
- Storage sizes
- Domain names
- Labels and annotations

Refer to the Kubernetes documentation for detailed information about each resource type.