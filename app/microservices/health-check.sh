#!/bin/bash
set -u

# Vintage Microservices Health Check
echo "🔍 Checking Vintage Microservices Health..."
echo ""

FAILURES=0

check_http() {
    local name="$1"
    local url="$2"
    local expected="${3:-200}"

    local status
    status=$(curl -sS -o /tmp/vintage-health-body -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "000")

    if [ "$status" = "$expected" ]; then
        echo "✅ $name ($url) returned $status"
    else
        echo "❌ $name ($url) returned $status, expected $expected"
        if [ -s /tmp/vintage-health-body ]; then
            echo "   Response: $(head -c 200 /tmp/vintage-health-body)"
        fi
        FAILURES=$((FAILURES + 1))
    fi
}

check_json_count() {
    local name="$1"
    local url="$2"
    local jq_expr="$3"

    local body status count
    body=$(mktemp)
    status=$(curl -sS -o "$body" -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "000")

    if [ "$status" != "200" ]; then
        echo "❌ $name ($url) returned $status"
        echo "   Response: $(head -c 200 "$body")"
        rm -f "$body"
        FAILURES=$((FAILURES + 1))
        return
    fi

    count=$(jq -r "$jq_expr" "$body" 2>/dev/null || echo "N/A")
    rm -f "$body"

    if [ "$count" = "N/A" ] || [ "$count" = "null" ]; then
        echo "❌ $name returned 200 but response shape was unexpected"
        FAILURES=$((FAILURES + 1))
    else
        echo "✅ $name returned $count item(s)"
    fi
}

# Frontend and gateway paths
echo "🌐 Frontend and Gateway:"
check_http "Frontend" "http://localhost:3000/"
check_json_count "Frontend /api/products proxy" "http://localhost:3000/api/products" ".data.products | length"
check_json_count "Gateway products" "http://localhost:3001/api/products" ".data.products | length"
check_json_count "Gateway categories" "http://localhost:3001/api/products/categories" ".data | length"
check_http "Gateway user-service health" "http://localhost:3001/api/users/health"

# Direct service health endpoints
echo ""
echo "🧩 Service health endpoints:"
check_http "Gateway" "http://localhost:3001/health"
check_http "Auth" "http://localhost:3002/health"
check_http "Product Service" "http://localhost:3003/health"
check_http "Order Service" "http://localhost:3004/health"
check_http "Orders Service" "http://localhost:3005/health"
check_http "User Service" "http://localhost:3006/health"

# Observability
echo ""
echo "📈 Observability:"
check_http "Prometheus" "http://localhost:9090/-/healthy"
check_http "Grafana" "http://localhost:3007/login"

# Database via Docker container, not host-installed pg tools
echo ""
echo "🗄️  Database:"
if docker exec vintage-postgres pg_isready -U postgres >/dev/null 2>&1; then
    PRODUCT_COUNT_DB=$(docker exec vintage-postgres psql -U postgres -d products_db -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
    echo "✅ Postgres is accepting connections with $PRODUCT_COUNT_DB products"
else
    echo "❌ Postgres is not accepting connections inside the container"
    FAILURES=$((FAILURES + 1))
fi

echo ""
echo "🔗 Quick Access Links:"
echo "   Frontend:   http://localhost:3000/products"
echo "   Gateway:    http://localhost:3001/api/products"
echo "   Grafana:    http://localhost:3007"
echo "   Prometheus: http://localhost:9090"

echo ""
if [ "$FAILURES" -eq 0 ]; then
    echo "✅ All health checks passed"
else
    echo "❌ $FAILURES health check(s) failed"
    echo ""
    echo "🛠️  Useful debug commands:"
    echo "   docker compose -f docker-compose.yml ps"
    echo "   docker compose -f docker-compose.yml logs -f gateway product-service user-service"
    exit 1
fi
