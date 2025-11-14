#!/bin/bash
# Add missing fields to Sale test objects

# Files to fix
FILES="src/infrastructure/repositories/sale-repository-drizzle.test.ts src/application/use-cases/create-sale.test.ts"

for file in $FILES; do
    # Replace objects that have netTotal but miss other fields
    sed -i 's/netTotal: \([0-9.]*\),$/grossTotal: \1,\n        discount: 0,\n        addition: 0,\n        netTotal: \1,\n        payments: [],/g' "$file"
    
    # Handle cases where netTotal is the last field before status
    sed -i '/netTotal: [0-9.]*,$/,/status:/ {
        /netTotal:/a\        grossTotal: PLACEHOLDER,\n        discount: 0,\n        addition: 0,\n        payments: [],
    }' "$file"
done
