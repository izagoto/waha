const Queue = require("bull");
const engine = require("../services/engineService");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const messageQueue = new Queue("waha-messages", REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
  },
  limiter: { max: 5, duration: 2000 },
});

messageQueue.process(5, async (job) => {
  const { deviceId, to, text } = job.data;
  const result = await engine.sendMessage(deviceId, to, text);
  return result;
});

messageQueue.on("completed", (job, result) => {
  console.log(`[Queue] Job ${job.id} completed`, result);
});

messageQueue.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed:`, err.message);
});

async function addToQueue(deviceId, to, text, options = {}) {
  const job = await messageQueue.add({ deviceId, to, text }, options);
  return { jobId: job.id, deviceId, to };
}

async function getJobStatus(jobId) {
  const job = await messageQueue.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  return { id: job.id, state, data: job.data, progress: job.progress() };
}

module.exports = { messageQueue, addToQueue, getJobStatus };
