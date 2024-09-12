import { db } from "@/db"
import { selectUserSchema, users } from "@/db/schema"
import { authMiddleware } from "@/http/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"

export async function getCurrentUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .route({
      method: "GET",
      url: "/me",
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
        description: "Gets the current user",
        response: {
          200: selectUserSchema
          // 401: z.object({})
        }
      },
      handler: async (request) => {
        const userId = await request.getCurrentUserId()

        const user = await db.query.users.findFirst({
          where: eq(users?.id, userId)
        })

        return user
      }
    })
}
