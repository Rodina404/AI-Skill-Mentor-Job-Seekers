#!/usr/bin/env bash

# deploy-minikube.sh
# Deploys the full AI Skill Mentor platform stack to Minikube.
# Run from repository root.

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}           AI Skill Mentor - Minikube Deployment            ${NC}"
echo -e "${CYAN}============================================================${NC}"

# Helper function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed or not in PATH.${NC}" >&2
        return 1
    fi
}

# 1. Prerequisites Check
echo -e "${YELLOW}Checking prerequisites...${NC}"
check_command minikube
check_command kubectl
check_command docker
echo -e "${GREEN}✓ All prerequisites met.${NC}"
echo ""

# 2. Start Minikube with Optimized Resources
echo -e "${YELLOW}Starting Minikube (6GB RAM, 4 CPUs)...${NC}"
if minikube status | grep -q "Running"; then
    echo -e "${GREEN}✓ Minikube is already running.${NC}"
else
    minikube start --memory=6144 --cpus=4
    echo -e "${GREEN}✓ Minikube started successfully.${NC}"
fi
echo ""

# 3. Direct Terminal Docker Context to Minikube
echo -e "${YELLOW}Configuring Docker context to use Minikube registry...${NC}"
eval $(minikube docker-env)
echo -e "${GREEN}✓ Docker context switched.${NC}"
echo ""

# 4. Build Docker Images inside Minikube
echo -e "${YELLOW}Building Docker images inside Minikube's Docker daemon...${NC}"

build_image() {
    local tag=$1
    local path=$2
    echo -e "${CYAN}Building $tag from $path...${NC}"
    docker build -t "$tag" "$path"
}

build_image "ai-skill-mentor/m1-extraction:latest" "AI-Microservices/m1_extraction_service"
build_image "ai-skill-mentor/skill-normalization:latest" "AI-Microservices/skill_normalization_service"
build_image "ai-skill-mentor/cv-matching:latest" "AI-Microservices/cv_matching_service"
build_image "ai-skill-mentor/gap-engine:latest" "AI-Microservices/gap-engin-service"
build_image "ai-skill-mentor/m5-roadmap:latest" "AI-Microservices/m5_roadmap_service"
build_image "ai-skill-mentor/course-recommendation:latest" "AI-Microservices/course_recommendation_service"
build_image "ai-skill-mentor/job-recommendation:latest" "AI-Microservices/job_recommendation_service"
build_image "ai-skill-mentor/express-backend:latest" "backend"
build_image "ai-skill-mentor/frontend:latest" "Frontend-React"

echo -e "${GREEN}✓ All 9 images built successfully inside Minikube.${NC}"
echo ""

# 5. Enable Ingress Controller
echo -e "${YELLOW}Enabling Ingress addon in Minikube...${NC}"
minikube addons enable ingress
echo -e "${GREEN}✓ Ingress addon enabled.${NC}"
echo ""

# 6. Apply Kubernetes Manifests
echo -e "${YELLOW}Applying Kubernetes configurations...${NC}"

# Apply secrets first as other deployments reference them
if [ -f "k8s/secrets.yaml" ]; then
    echo -e "${CYAN}Applying Secrets...${NC}"
    kubectl apply -f k8s/secrets.yaml
else
    echo -e "${RED}Error: k8s/secrets.yaml not found.${NC}"
    exit 1
fi

if [ -f "k8s/configmap.yaml" ]; then
    echo -e "${CYAN}Applying ConfigMaps...${NC}"
    kubectl apply -f k8s/configmap.yaml
else
    echo -e "${RED}Error: k8s/configmap.yaml not found.${NC}"
    exit 1
fi

if [ -f "k8s/microservices.yaml" ]; then
    echo -e "${CYAN}Applying AI Microservices...${NC}"
    kubectl apply -f k8s/microservices.yaml
else
    echo -e "${RED}Error: k8s/microservices.yaml not found.${NC}"
    exit 1
fi

if [ -f "k8s/backend-frontend.yaml" ]; then
    echo -e "${CYAN}Applying Express Backend & React Frontend...${NC}"
    kubectl apply -f k8s/backend-frontend.yaml
else
    echo -e "${RED}Error: k8s/backend-frontend.yaml not found.${NC}"
    exit 1
fi

if [ -f "k8s/ingress.yaml" ]; then
    echo -e "${CYAN}Applying Ingress routes...${NC}"
    kubectl apply -f k8s/ingress.yaml
else
    echo -e "${RED}Error: k8s/ingress.yaml not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All manifests applied.${NC}"
echo ""

# 7. Wait for Pods to be Ready
echo -e "${YELLOW}Waiting for pods to reach 'Ready' status (timeout: 5 minutes)...${NC}"
kubectl wait --for=condition=ready pod --all --timeout=300s
echo -e "${GREEN}✓ All pods are running and ready.${NC}"
echo ""

# 8. Print Access URL
MINIKUBE_IP=$(minikube ip)

echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}           AI Skill Mentor - Deployment Complete            ${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "Access your app at:      ${GREEN}http://${MINIKUBE_IP}${NC}"
echo -e "API backend endpoint:    ${GREEN}http://${MINIKUBE_IP}/api${NC}"
echo ""
echo -e "${YELLOW}Useful Diagnostics Commands:${NC}"
echo -e "  kubectl get pods                      - Check statuses"
echo -e "  kubectl logs -l app=<app-label>       - View logs"
echo -e "  minikube dashboard                    - View visual dashboard"
echo -e "  minikube service list                 - List services"
echo -e "${CYAN}============================================================${NC}"
