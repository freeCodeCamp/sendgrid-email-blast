import chalk from "chalk";
import { Options, Params } from "cli-progress";

export const barFormatter = (
  options: Options,
  params: Params,
  payload: { [key: string]: string }
): string => {
  const bar = (options.barCompleteString || "=").substring(
    0,
    Math.round(params.progress * (options.barsize || 40))
  );
  const barIncomplete = options.barIncompleteString?.substring(
    0,
    options.barIncompleteString.length - bar.length
  );
  const percentage = Math.floor(params.progress * 10000) / 100;

  const etaTime = params.eta;
  const etaHours = etaTime >= 3600 ? etaTime / 3600 : 0;
  const etaMinutes = etaTime >= 60 ? (etaTime % 3600) / 60 : 0;
  const etaSeconds = (etaTime - etaHours - etaMinutes) % 60;
  switch (payload.task) {
    case "Processed":
      return chalk.cyan(
        `Processed: [${bar}${barIncomplete}] | ${percentage}% complete! | ETA: ${~~etaHours}h ${~~etaMinutes}m ${~~etaSeconds}s | ${
          params.value
        }/${params.total}`
      );
    case "Sent":
      return chalk.green(
        `     Sent: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${params.value}`
      );
    case "Failed":
      return chalk.red(
        `   Failed: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${params.value}`
      );
    case "Skipped":
      return chalk.yellow(
        `  Skipped: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${params.value}`
      );
  }
  return ``;
};
