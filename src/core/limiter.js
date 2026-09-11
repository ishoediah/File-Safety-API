import pLimit from "p-limit";

const MAX_CONCURRENT = 10;
const MAX_QUEUE = 5;

const limit = pLimit(MAX_CONCURRENT)

function hasCapacity() {
    return limit.pendingCount < MAX_QUEUE
}

export { limit, hasCapacity}