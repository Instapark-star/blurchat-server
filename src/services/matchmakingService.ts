// Simple in-memory queue for matchmaking
const queue: string[] = [];

/**
 * Add a user to the matchmaking queue.
 * If another user is waiting, return their ID (match found).
 * Otherwise, keep them in queue and return null.
 */
export function addUserToQueue(socketId: string): string | null {
  if (queue.length > 0) {
    const partner = queue.shift()!;
    return partner;
  } else {
    queue.push(socketId);
    return null;
  }
}

/**
 * Remove a user from the matchmaking queue.
 */
export function removeUserFromQueue(socketId: string): void {
  const index = queue.indexOf(socketId);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}
