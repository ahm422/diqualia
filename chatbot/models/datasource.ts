/**
 * Chatbot data-source boundary.
 *
 * The chatbot never reaches into the application beyond this file. It defines
 * the narrow slice of the application's D1/Prisma client that the chatbot
 * reads from (structured knowledge + KB tracking tables). The application
 * passes its Prisma client into `chatbot/api`; structural typing means the
 * real client satisfies this interface without the chatbot importing app
 * business code.
 */
import type { PrismaClient } from "../../lib/generated/prisma/client";

export type ChatbotDataSource = Pick<
  PrismaClient,
  | "homeHero"
  | "aboutHero"
  | "aboutBuiltForItem"
  | "servicesPage"
  | "serviceSection"
  | "processPage"
  | "processStep"
  | "industriesPage"
  | "industrySector"
  | "storyPage"
  | "contactPage"
  | "careerPage"
  | "jobOpening"
  | "blogPost"
  | "$queryRawUnsafe"
  | "$executeRawUnsafe"
>;
