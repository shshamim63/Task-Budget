<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
<h1 align="center">Enterprise Expense Tracker</h1>

## Description

A RESTful API service that tracks the expenses incured by the employees while completing a task.

## Local Setup
1. You must have docker installed. If you don't then please follow the [Link](https://docs.docker.com/engine/install/) to install it in your system.
2. create a token by using your terminal

```bash
node
```

```javascript
require('crypto').randomBytes(64).toString('hex')
```
This will create a string copy it and use it as the ACCESS_TOKEN in the .env file
3. create a .env file with the following property
```env
PORT=3000
DATABASE_URL= Docker postgresql url
SALTROUND=10
ACCESS_TOKEN=
```
4. Run the docker container
```bash
docker compose -f docker-compose.dev.yml up --build
```
5. you have to push the prisma migrations
```bash
docker ps #this will show the running containers
docker exec -it <node-app> sh
> npx prisma migrate deploy # this will deploy the migrations
```

## License

Tracker [MIT licensed](LICENSE).
