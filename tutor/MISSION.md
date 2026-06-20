# Mission: Gateway API on EKS for Hiraya

## Why
Learn Kubernetes Gateway API well enough to explain, operate, and document the Hiraya dev platform's public ingress path on AWS EKS. The practical goal is to make confident network design decisions for the portfolio: shared ALB, private nodes, DNS, TLS, and clear ownership between Terraform and GitOps.

## Success looks like
- Trace a request from `hiraya.noidilin.dev` through Route 53, ALB, Gateway API, frontend nginx, and the application `gateway` service.
- Explain who owns Gateway API resources, the AWS load balancer, DNS records, and app routes in this repo.
- Distinguish Kubernetes Gateway API from AWS API Gateway and from the app's Node/Express `gateway` microservice.
- Safely review or change `Gateway`, `HTTPRoute`, ExternalDNS, or AWS Load Balancer Controller configuration.

## Constraints
- Keep lessons short and directly tied to the Hiraya repo.
- Prefer official Kubernetes, AWS Load Balancer Controller, and ExternalDNS documentation.
- Optimize for dev environment clarity and portfolio explanation, not production-scale HA perfection.

## Out of scope
- Full service mesh/GAMMA design.
- Deep AWS API Gateway HTTP API design, except where needed to avoid naming confusion.
- Production multi-region ingress architecture.
