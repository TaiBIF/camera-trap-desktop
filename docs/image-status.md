# Image Status


## process flow & status code

| action | environment | status code |
| --- | --- | --- |
| add folder | local  | 10 |
| viewed | local | 20 | 
| annotated | local | 30 |
| start upload | server | 100 |
| server process uploaded annotation | server | 110 |
| file uploaded to AWS S3 | local & AWS S3 | 200 |

1. 先上傳所有 annotation 到 server
- get server image id
2. 再上傳檔案到 AWS S3
