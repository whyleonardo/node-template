import fastify from "fastify"
import fastifySwaggerUI from "@fastify/swagger-ui"
import fastifyJwt from "@fastify/jwt"
import fastifySwagger from "@fastify/swagger"
import fastifyCors from "@fastify/cors"
import scalarAPIReference from "@scalar/fastify-api-reference"

import { authWithGithub } from "@/http/routes/auth/authenticate-with-github"
import { errorHandler } from "@/http/error-handler"

import { env } from "@/env"

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod"

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Node Template",
      description: "Sample Node Template",
      version: "0.0.0"
    },
    components: {
      securitySchemes: {
        token: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {}
    }
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUI, {
  routePrefix: "/reference"
})

app.register(scalarAPIReference, {
  routePrefix: "/docs",
  configuration: {
    title: "The Docs",
    spec: {
      url: "/reference/json"
    }
  }
})

app.register(fastifyCors, {
  origin: env.NODE_ENV === "dev" ? "*" : env.ORIGIN
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

app.setErrorHandler(errorHandler)

// ================================ ROUTES ================================
app.register(authWithGithub)
