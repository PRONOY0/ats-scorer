import { prisma } from "./prisma";

export async function updateLastSeenAt(userId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });
}
