import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { eq } from "drizzle-orm"

import { z } from "zod"

import { env } from "@/env"
import { db } from "@/db"
import { BadRequestError } from "@/http/_errors/bad-request-error"
import { accounts, users } from "@/db/schema"

export async function authWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/sessions/github",
    schema: {
      tags: ["Auth"],
      summary: "Authenticate with GitHub",
      body: z.object({
        code: z.string()
      }),
      response: {
        201: z.object({
          token: z.string()
        })
      }
    },
    handler: async (request, reply) => {
      const { code } = request.body

      const githubAuthURL = new URL(
        "https://github.com/login/oauth/access_token"
      )

      githubAuthURL.searchParams.set(
        "client_secret",
        env.GITHUB_OAUTH_CLIENT_SECRET
      )

      githubAuthURL.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID)

      githubAuthURL.searchParams.set(
        "redirect_uri",
        env.GITHUB_OAUTH_REDIRECT_URI
      )

      githubAuthURL.searchParams.set("code", code)

      const githubAccessTokenReponse = await fetch(githubAuthURL, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      })

      const githubAccessTokenData = await githubAccessTokenReponse.json()

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal("bearer"),
          scope: z.string()
        })
        .parse(githubAccessTokenData)

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      })

      const githubUserData = await githubUserResponse.json()

      const {
        avatar_url: avatarUrl,
        email,
        id: githubUserId,
        name
      } = z
        .object({
          id: z.number().int().transform(String),
          email: z.string().nullable(),
          avatar_url: z.string().url(),
          name: z.string().nullable()
        })
        .parse(githubUserData)

      if (email === null) {
        throw new BadRequestError(
          "Your Github account must have and email to authenticate"
        )
      }

      let user = await db.query.users.findFirst({
        where: eq(users.email, email)
      })

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({
            avatarUrl,
            name,
            email
          })
          .returning()

        user = newUser
      }

      let account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, user.id)
      })

      if (!account) {
        const [newAccount] = await db.insert(accounts).values({
          provider: "github",
          providerAccountId: githubUserId,
          userId: user.id
        })

        account = newAccount
      }

      const token = await reply.jwtSign(
        {
          sub: user.id
        },
        {
          sign: {
            expiresIn: "7d"
          }
        }
      )

      return reply.status(201).send({ token })
    }
  })
}
