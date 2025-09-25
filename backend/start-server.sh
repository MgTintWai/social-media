#!/bin/bash
# Start Laravel server with custom PHP settings for large file uploads

cd "$(dirname "$0")"

echo "Starting Laravel server with custom PHP settings for video uploads..."
echo "Settings:"
echo "- upload_max_filesize: 200M"
echo "- post_max_size: 220M" 
echo "- memory_limit: 512M"
echo "- max_execution_time: 600 seconds"
echo ""

php -S localhost:8000 -t public \
    -d upload_max_filesize=200M \
    -d post_max_size=220M \
    -d memory_limit=512M \
    -d max_execution_time=600 \
    -d max_input_time=600
