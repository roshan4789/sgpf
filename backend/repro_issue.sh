#!/bin/bash
echo "Testing Backend API..."

echo "1. Getting products..."
curl -v http://localhost:5000/api/products

echo -e "\n2. Logging in..."
curl -v -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"worker@ganpati.com", "password":"worker123"}'
