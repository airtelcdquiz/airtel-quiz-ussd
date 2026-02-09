#!/bin/bash

set -e

PROJECT_NAME="ussd-service"

echo "📁 Création du projet $PROJECT_NAME ..."


# Structure src
mkdir -p src/{bootstrap,config,http/{routes,controllers,middlewares},engine,pages,services,adapters,utils/{xml},constants,tests}

# bootstrap
touch src/bootstrap/{app.js,server.js,shutdown.js}

# config
touch src/config/{env.js,redis.js,database.js,operators.js,index.js}

# http
touch src/http/routes/ussd.route.js
touch src/http/controllers/ussd.controller.js
touch src/http/middlewares/{xmlOnly.middleware.js,error.middleware.js}

# engine
touch src/engine/{ussd.engine.js,context.builder.js,state.registry.js}

# pages
touch src/pages/{start.page.js,balance.page.js,quiz.page.js,payment.page.js,end.page.js}

# services
touch src/services/{session.service.js,user.service.js,balance.service.js,quiz.service.js,payment.service.js,http.service.js}

# adapters
touch src/adapters/{airtel.adapter.js,mtn.adapter.js,index.js}

# utils
touch src/utils/xml/{parser.js,builder.js}
touch src/utils/{timeout.js,logger.js,errors.js}

# constants
touch src/constants/{pages.js,session.js}

# tests
touch src/tests/{engine.test.js,pages.test.js}

# docker
mkdir -p docker
touch docker/{Dockerfile,docker-compose.yml}

# fichiers racine
touch .env package.json README.md

echo "✅ Structure $PROJECT_NAME créée avec succès !"
